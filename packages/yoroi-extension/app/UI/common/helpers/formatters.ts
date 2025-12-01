export function truncateFormatter(addr: string, cutoff: number): string {
  const shortener = '...';
  if (addr.length - shortener.length <= cutoff) {
    return addr;
  }
  return addr.substring(0, cutoff / 2) + shortener + addr.substring(addr.length - cutoff / 2, addr.length);
}
