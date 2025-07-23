export function imageExists(imageSrc: string, onload: (this: GlobalEventHandlers, ev: Event) => any, onerror: OnErrorEventHandler) {
  const img: HTMLImageElement = new Image();
  img.onload = onload;
  img.onerror = onerror;
  img.src = imageSrc;
}
