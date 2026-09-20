

export function compressEvidenceImage(
  file: File,
  {
    maxWidth = 1200,
    quality = 0.82,
  }: {
    maxWidth?: number;
    quality?: number;
  } = {}
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Unable to read evidence image'));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to prepare evidence image'));
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.filter = 'brightness(1.12) contrast(1.06)';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
