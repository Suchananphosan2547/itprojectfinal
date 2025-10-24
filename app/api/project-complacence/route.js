// /app/api/project-complacence/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ฟังก์ชันสำหรับดึง Access Token (คัดลอกมาใช้ได้เลย)
async function getAccessToken(request) {
  let accessToken = request.headers.get('authorization');
  if (!accessToken) {
    const cookieStore = cookies(); 
    accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) accessToken = `Bearer ${accessToken}`;
  }
  return accessToken;
}

export async function GET(req) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // ⭐ ไม่มีการส่ง Query String ใน Log จึงเรียกตรงๆ
    // API ปลายทางของ Backend (สันนิษฐานว่าชื่อ /project-complacence)
    const response = await axios.get(`${API_BASE_URL}/project-complacence`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Project Complacence GET Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}