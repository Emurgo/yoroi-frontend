// @flow

export function downloadQrCode(id: string, name: string = 'qrcode') {
    if (id == null) throw new Error('QR code element id is required');
    const canvas = document.getElementById(id);
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}