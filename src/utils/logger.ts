/**
 * Dev-only logger. No-op in production to avoid leaking data and blocking JS thread.
 */
export const devLog = __DEV__ ? console.log.bind(console) : () => {};
export const devWarn = __DEV__ ? console.warn.bind(console) : () => {};
export const devError = __DEV__ ? console.error.bind(console) : () => {};
