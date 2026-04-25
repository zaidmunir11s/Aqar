import type { SupabaseClient } from "@supabase/supabase-js";
import * as MediaLibrary from "expo-media-library";
import { File } from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { decode as decodeBase64 } from "base64-arraybuffer";

export const DEFAULT_LISTING_IMAGES_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_LISTING_IMAGES_BUCKET ?? "listing-images";

export type UploadMediaItem = {
  /** Expo MediaLibrary Asset ID (needed on iOS when uri is `ph://...`). */
  assetId?: string;
  uri: string;
  order: number;
  mediaType?: "photo" | "video" | "unknown";
};

/** Matches backend `ListingMedia.kind` */
export type ListingMediaKindApi = "PHOTO" | "VIDEO";

function inferListingMediaKind(
  uri: string,
  mediaType?: string,
): ListingMediaKindApi {
  if (mediaType === "video") return "VIDEO";
  if (mediaType === "photo") return "PHOTO";
  const lower = uri.split("?")[0]?.toLowerCase() ?? "";
  if (lower.match(/\.(mp4|mov|webm|m4v)$/)) return "VIDEO";
  return "PHOTO";
}

function extFromUriAndType(uri: string, mediaType?: string): string {
  const lower = uri.split("?")[0]?.toLowerCase() ?? "";
  if (mediaType === "video" || lower.match(/\.(mp4|mov|webm|m4v)$/)) {
    if (lower.endsWith(".mov")) return "mov";
    if (lower.endsWith(".webm")) return "webm";
    if (lower.endsWith(".m4v")) return "m4v";
    return "mp4";
  }
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".heic")) return "heic";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  return mediaType === "video" ? "mp4" : "jpg";
}

function contentTypeForExt(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "m4v":
      return "video/x-m4v";
    default:
      return "image/jpeg";
  }
}

async function readFileUriAsArrayBuffer(fileUri: string): Promise<ArrayBuffer> {
  const file = new File(fileUri);
  if (!file.exists) {
    throw new Error("Could not read local file.");
  }
  // Some iOS URIs resolve but end up empty; guard early.
  if (typeof file.size === "number" && file.size <= 0) {
    throw new Error("Selected file is empty. Please re-select the media.");
  }
  const b64 = await file.base64();
  if (!b64 || b64.length === 0) {
    throw new Error("Could not read local file contents.");
  }
  return decodeBase64(b64);
}

/**
 * Upload local photo/video URIs to Supabase Storage and return public URLs for `listing.media`.
 * Requires a public bucket (or policies allowing anon uploads) — see `.env.example`.
 */
export type UploadedListingMedia = {
  url: string;
  order: number;
  kind: ListingMediaKindApi;
};

export async function uploadListingMediaToSupabase(
  supabase: SupabaseClient,
  items: UploadMediaItem[],
  options?: { bucket?: string; prefix?: string },
): Promise<UploadedListingMedia[]> {
  const bucket = options?.bucket ?? DEFAULT_LISTING_IMAGES_BUCKET;
  const prefix = options?.prefix ?? "listings";
  const out: UploadedListingMedia[] = [];

  for (const { uri, order, mediaType, assetId } of items) {
    let trimmed = uri.trim();
    if (!trimmed) continue;
    const kind = inferListingMediaKind(trimmed, mediaType);
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      out.push({ url: trimmed, order, kind });
      continue;
    }

    // iOS Photos URIs (`ph://...`) aren't fetchable. Resolve to a local file URI via MediaLibrary.
    if (trimmed.startsWith("ph://")) {
      if (!assetId) {
        throw new Error(
          "Could not read iOS photo. Missing assetId for ph:// URI.",
        );
      }
      const info = await MediaLibrary.getAssetInfoAsync(assetId);
      const resolved = info.localUri || info.uri;
      if (!resolved || resolved.startsWith("ph://")) {
        throw new Error(
          "Could not access iOS photo file. Please re-select the media.",
        );
      }
      trimmed = resolved;
    }

    // iOS often provides HEIC; convert to JPEG so it renders everywhere.
    let ext = extFromUriAndType(trimmed, mediaType);
    if (kind === "PHOTO" && ext === "heic") {
      const manipulated = await ImageManipulator.manipulateAsync(trimmed, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      trimmed = manipulated.uri;
      ext = "jpg";
    }

    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${order}.${ext}`;
    const contentType = contentTypeForExt(ext);

    // Prefer FileSystem for local URIs (more reliable than fetch(file://...) on iOS).
    const payload: Blob | ArrayBuffer = trimmed.startsWith("file://")
      ? await readFileUriAsArrayBuffer(trimmed)
      : await (async () => {
          const res = await fetch(trimmed);
          if (!res.ok) {
            throw new Error(`Could not read file (${res.status})`);
          }
          const blob = await res.blob();
          // If the blob is empty, fall back to FileSystem if possible.
          const size = (blob as any)?.size;
          if (
            typeof size === "number" &&
            size <= 0 &&
            trimmed.startsWith("file://")
          ) {
            return await readFileUriAsArrayBuffer(trimmed);
          }
          return blob;
        })();

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, payload as any, {
        contentType,
        upsert: false,
      });

    if (upErr) {
      throw new Error(upErr.message || "Upload failed");
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!pub?.publicUrl) {
      throw new Error("No public URL for uploaded file");
    }
    out.push({ url: pub.publicUrl, order, kind });
  }

  return out.sort((a, b) => a.order - b.order);
}

/** @deprecated Use `uploadListingMediaToSupabase` */
export const uploadListingImagesToSupabase = uploadListingMediaToSupabase;
