// @flow

export function downloadQrCode(id: string, name: string = 'qrcode') {
  const canvas = document.getElementById(id);
  if (!canvas) throw new Error('QR code element not found');
    const pngUrl = canvas
      // $FlowFixMe
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${name}.png`;
    document.body?.appendChild(downloadLink);
    downloadLink.click();
    document.body?.removeChild(downloadLink);
}