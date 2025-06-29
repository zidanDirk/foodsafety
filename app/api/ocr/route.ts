import { NextResponse } from 'next/server';
import config from '@/config/baidu-ocr.config';
import axios from 'axios';

async function getAccessToken() {
  const options = {
    method: 'POST',
    url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`,
  };
  
  const response = await axios(options);
  return response.data.access_token;
}

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    
    const options = {
      method: 'POST',
      url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: {
        image: image,
        detect_direction: 'false',
        paragraph: 'false',
        probability: 'false',
        multidirectional_recognize: 'false'
      }
    };

    const response = await axios(options);
    const result = response.data;

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
