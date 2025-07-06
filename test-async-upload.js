// 测试异步上传功能的脚本
const testAsyncUpload = async () => {
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  const testUserId = 'test-user-123';

  try {
    console.log('Testing async upload...');
    
    // 1. 创建异步任务
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: testImage,
        userId: testUserId
      })
    });

    const uploadResult = await uploadResponse.json();
    console.log('Upload result:', uploadResult);

    if (!uploadResult.success) {
      console.error('Upload failed:', uploadResult.error);
      return;
    }

    const taskId = uploadResult.taskId;
    console.log('Task created with ID:', taskId);

    // 2. 轮询任务状态
    let attempts = 0;
    const maxAttempts = 30;

    const pollStatus = async () => {
      attempts++;
      console.log(`Polling attempt ${attempts}...`);

      const statusResponse = await fetch(`http://localhost:3000/api/task-status?taskId=${taskId}`);
      const statusResult = await statusResponse.json();
      
      console.log('Task status:', statusResult);

      if (statusResult.status === 'completed') {
        console.log('✅ Task completed successfully!');
        console.log('Result:', statusResult.result);
        return;
      } else if (statusResult.status === 'failed') {
        console.log('❌ Task failed:', statusResult.error);
        return;
      } else if (attempts < maxAttempts) {
        console.log(`⏳ Task status: ${statusResult.status}, progress: ${statusResult.progress}%`);
        setTimeout(pollStatus, 2000);
      } else {
        console.log('⏰ Polling timeout');
      }
    };

    // 开始轮询
    setTimeout(pollStatus, 1000);

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  testAsyncUpload();
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
  window.testAsyncUpload = testAsyncUpload;
  console.log('Test function available as window.testAsyncUpload()');
}
