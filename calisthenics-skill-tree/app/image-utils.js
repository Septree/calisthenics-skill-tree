// Convert an uploaded image file into a small base64 data URL, entirely in the
// browser. This lets us store exercise images directly in Firestore (free,
// Spark plan) instead of paid Firebase Storage. We downscale to a thumbnail so
// the result stays far under Firestore's ~1 MB per-document limit.
export function fileToCompressedDataUrl(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        // PNG keeps transparency (icons are usually line art on transparent bg).
        const dataUrl = canvas.toDataURL('image/png');

        // Safety: refuse anything that would blow past Firestore's doc limit.
        if (dataUrl.length > 900_000) {
          reject(new Error('Image is too large even after shrinking — try a simpler / smaller image.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
