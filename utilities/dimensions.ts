import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const ResponsiveHeight = (value: number) => verticalScale(value);

const ResponsiveWidth = (value: number) => scale(value);

const Fontsizes = {
  xxs: moderateScale(10), // Extra-extra small – captions, footnotes

  xs: moderateScale(12), // Extra small – secondary labels, helper text

  lable: moderateScale(13),

  sm: moderateScale(14), // Small – body text on smaller UI components

  md: moderateScale(16), // Medium – default body text

  lg: moderateScale(18), // Large – slightly emphasized body or subtitles

  xl: moderateScale(20), // Extra large – subtitles, buttons, short headings

  xxl: moderateScale(24), // Extra-extra large – section titles, card headers

  xxxl: moderateScale(30), // 3x large – prominent titles, modals

  title: moderateScale(23),

  heading: moderateScale(36), // Main screen titles or large headers

  display: moderateScale(42), // Hero text, splash screens, branding
};

const Spacing = {
  none: 0, // No spacing

  xs: moderateScale(4), // Extra small – tight spacing (e.g., between icons/text)

  sm: moderateScale(8), // Small – spacing between elements in small UI blocks

  md: moderateScale(12), // Medium – default spacing between sections

  lg: moderateScale(16), // Large – section padding/margin

  xl: moderateScale(24), // Extra large – larger section gaps

  xxl: moderateScale(32), // Extra-extra large – big spacing, e.g., modals

  xxxl: moderateScale(40), // 3x large – screens, banners, or final padding

  screenPadding: moderateScale(20), // Default horizontal screen padding
};

export { ResponsiveHeight, ResponsiveWidth, Fontsizes, Spacing };
