export async function compressImage(imageFile: string, preserveTransparency = false): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageFile;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Calculate new dimensions (max 800px width/height)
      let width = img.width;
      let height = img.height;
      const maxSize = 800;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // For PNG with transparency
      if (preserveTransparency) {
        ctx.clearRect(0, 0, width, height);
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL(preserveTransparency ? 'image/png' : 'image/jpeg', 0.7));
    };
  });
}