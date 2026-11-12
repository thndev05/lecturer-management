export function createImageUploadBody(file: Blob, filename: string) {
  if (file.size > 5 * 1024 * 1024) throw new Error('photoInvalid');
  const body = new FormData();
  body.append('file', file, filename);
  return body;
}
