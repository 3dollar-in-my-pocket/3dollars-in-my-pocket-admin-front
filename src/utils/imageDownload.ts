/**
 * 원격 이미지를 파일로 내려받습니다.
 *
 * `download` 속성만 사용하는 경우 다른 도메인의 이미지에서는 브라우저가
 * 새 탭을 여는 방식으로 처리할 수 있어, Blob URL로 변환한 뒤 저장합니다.
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error('이미지 파일을 불러오지 못했습니다.');
  }

  const blob = await response.blob();
  const extension = getImageExtension(blob.type);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = `${filename}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function getImageExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  return extensions[contentType.toLowerCase()] || 'jpg';
}
