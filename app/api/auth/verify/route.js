import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request) {
  try {
    let accessToken = request.headers.get('authorization');
    
    // ถ้าไม่มี authorization header ให้อ่านจาก cookie
    if (!accessToken) {
      const cookieStore = await cookies();
      const tokenFromCookie = cookieStore.get('accessToken')?.value;
      if (tokenFromCookie) {
        accessToken = `Bearer ${tokenFromCookie}`;
      }
    }
    
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // เรียกใช้ backend API จริง
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Auth Verify Error:', error.message);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
} 