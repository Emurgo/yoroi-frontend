

export function imageExists(imageSrc: string, onload: void => void, onerror: void => void) {
    const img = new Image();
    img.onload = onload;
    img.onerror = onerror;
    img.src = imageSrc;
  }