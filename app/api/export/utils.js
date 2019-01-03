/**
 * Make browser to download the specified blob of bytes as a file with the specified name
 */
export async function sendFileToUser(data: Blob, fileName: string): Promise<void> {
  const a = window.document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(data);
  const body = document.body;
  if (body) {
    body.appendChild(a);
    a.click();
    body.removeChild(a);
  } else {
    throw Error('Cannot send file to user! No `document.body` available!');
  }
}
