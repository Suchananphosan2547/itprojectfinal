import { NextResponse } from 'next/server';
import axios from 'axios';

// ตั้งค่า URL พื้นฐานของ Backend API
// **สำคัญ:** ตรวจสอบให้แน่ใจว่าคุณได้ตั้งค่า NEXT_PUBLIC_API_BASE_URL 
// ในไฟล์ .env.local หรือ .env.production แล้ว
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

/**
 * @method GET
 * @path /api/my-project
 * @description ดึงรายการโครงการทั้งหมดที่ผู้ใช้ปัจจุบันได้ลงทะเบียนไว้แล้ว 
 * (ผู้ใช้จะถูกระบุจาก Authorization Token ที่ส่งต่อมาจาก Client)
 */
export async function GET(req) {
  // ตรวจสอบว่ามี API_BASE_URL ถูกตั้งค่าหรือไม่ ก่อนดำเนินการต่อ
  if (!API_BASE_URL) {
    console.error('Configuration Error: NEXT_PUBLIC_API_BASE_URL is not set.');
    return NextResponse.json({ 
      message: 'Server configuration error: Backend URL is missing.' 
    }, { status: 500 });
  }

  try {
    // 1. ดึง Access Token จาก Header 'Authorization' ที่ Client ส่งมา
    // Client Component จะส่ง Token มาในรูปแบบที่เก็บไว้ใน Cookies 
    // และ Axios (ใน Client) จะนำ Token นั้นใส่ใน Header 'Authorization'
    const accessToken = req.headers.get('authorization');
    
    // console.log('Received Authorization Header:', accessToken); // บรรทัด Debug

    if (!accessToken) {
      // 401 Unauthorized: ไม่มี Token
      return NextResponse.json({ 
        message: 'Authorization token not provided. Please log in.' 
      }, { status: 401 });
    }

    // 2. กำหนด Endpoint ของ Backend API
    // สมมติว่า Backend API สำหรับดึงโครงการที่ลงทะเบียนคือ /my-project
    const backendEndpoint = `${API_BASE_URL}/my-project`; 

    // 3. ส่งคำขอ GET ไปยัง Backend API พร้อมส่งต่อ Authorization Header
    const response = await axios.get(backendEndpoint, {
      headers: {
        // ส่ง Authorization Header ไปยัง Backend เพื่อระบุตัวตนผู้ใช้
        'Authorization': accessToken, 
      },
      // เพิ่ม timeout เพื่อป้องกันการรอนานเกินไป
      timeout: 10000 
    });

    // 4. ส่งข้อมูลโครงการกลับไปยัง Client Component
    // response.data ควรเป็น Array ของ Project Objects
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('API /my-project GET Error:', error.message);

    // 5. จัดการ Response ที่มาจาก Backend
    if (axios.isAxiosError(error) && error.response) {
      // ส่ง Error status และ data จาก Backend ตรงๆ กลับไปให้ Client เห็น
      // เช่น ถ้า Backend ตอบ 401, 403, 404 หรือ 500
      return NextResponse.json(error.response.data, { 
        status: error.response.status 
      });
    }
    
    // จัดการ Internal Server Error ทั่วไป หรือ Network Error
    return NextResponse.json({ 
      message: 'An unexpected error occurred while processing the request or connecting to the backend service.' 
    }, { status: 500 });
  }
}
