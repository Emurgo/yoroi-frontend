export function truncateFormatter(addr: string, cutoff: number): string {
  const shortener = '...';
  if (addr.length - shortener.length <= cutoff) {
    return addr;
  }
  return addr.substring(0, cutoff / 2) + shortener + addr.substring(addr.length - cutoff / 2, addr.length);
}

export function formatDrepDisplayName(name: string): string {
  // Truncate if it's a bech32 DRep ID (no givenName)
  if (name.startsWith('drep1')) {
    return truncateFormatter(name, 20);
  }
  return name;
}
