export function calculatePercentComplete(watchedCount: number, totalCount: number) {
  return totalCount <= 0 ? 0 : Math.round((watchedCount / totalCount) * 100);
}
