export function toLocalString(utcTimestamp: string): string {
  // Backend sends UTC timestamps without a timezone suffix — force UTC parsing
  const withZ = utcTimestamp.endsWith("Z") ? utcTimestamp : `${utcTimestamp}Z`;
  return new Date(withZ).toLocaleString();
}