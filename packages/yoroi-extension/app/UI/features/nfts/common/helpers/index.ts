export function imageExists(imageSrc: string, onload: () => void, onerror: () => void) {
  const img = new Image();
  img.onload = onload;
  img.onerror = onerror;
  img.src = imageSrc;
}
