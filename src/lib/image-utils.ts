import imageCompression from 'browser-image-compression';

export async function compressImage(
  file: File,
  options: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
  }
): Promise<File> {
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw error;
  }
}
