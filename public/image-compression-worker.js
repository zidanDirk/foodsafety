// Web Worker for image compression
self.onmessage = function(e) {
  const { file, targetSize } = e.data;
  
  // Create a promise to handle the async operations
  new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取 Canvas 上下文');
      }
      
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = calculateNewDimensions(img.width, img.height);
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to Blob with adaptive quality
          const quality = estimateCompressionQuality(file.size, targetSize);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }
              
              // Create new File object
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              
              resolve({
                success: true,
                compressedFile: compressedFile,
                originalSize: file.size,
                newSize: compressedFile.size,
                quality: quality
              });
            },
            file.type,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  })
  .then(result => {
    self.postMessage(result);
  })
  .catch(error => {
    self.postMessage({
      success: false,
      error: error.message
    });
  });
};

// Calculate new dimensions
function calculateNewDimensions(originalWidth, originalHeight) {
  const maxWidth = 1920;
  const maxHeight = 1080;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

// Estimate compression quality based on file size
function estimateCompressionQuality(currentSize, targetSize) {
  const compressionRatio = targetSize / currentSize;
  
  // If already smaller than target, use high quality
  if (compressionRatio >= 1) {
    return 0.9;
  }
  
  // Map compression ratio to quality (0.1-0.9)
  let quality = 0.1 + (compressionRatio * 0.8);
  
  // Ensure quality is within bounds
  return Math.max(0.1, Math.min(0.9, quality));
}