/** Local fixture rows use stable `local-*` IDs; database records use UUIDs. */
export function isLocalFallbackRecord(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith("local-");
}