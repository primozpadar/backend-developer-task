export const __prod__ = process.env.NODE_ENV === 'production';
export const __test__ = !!process.env.JEST_WORKER_ID;
