import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

// API_BASE_URL จะถูกดึงมาจากตัวแปรสภาพแวดล้อม (Environment Variable)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * @route GET /api/registrations/student
 * @description Proxy สำหรับดึงข้อมูลโครงการทั้งหมดที่นักศึกษาคนปัจจุบันได้ลงทะเบียนไว้
 * @access Private (ต้องใช้ Access Token)
 */
export async function GET(req) {
  // --- 1. การจัดการ Authentication Token ---
  let accessToken = req.headers.get('authorization');

  // หากไม่พบใน Header ให้ลองดึงจาก Cookie
  if (!accessToken) {
    const cookieStore = cookies();
    const tokenValue = cookieStore.get('accessToken')?.value;
    if (tokenValue) {
      accessToken = `Bearer ${tokenValue}`;
    }
  }

  // หากยังไม่มี Token ให้ส่ง 401 Unauthorized
  if (!accessToken) {
    return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
  }

  try {
    // --- 2. เรียก Backend API หลัก ---
    const registrationsResponse = await axios.get(`${API_BASE_URL}/registrations/student`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    // --- 3. ส่งข้อมูลกลับไปให้ Frontend ---
    return NextResponse.json(registrationsResponse.data);

  } catch (error) {
    console.error('API /api/registrations/student GET Error:', error.message);

    // --- 4. การจัดการข้อผิดพลาด ---
    if (error.response) {
      const status = error.response.status;
      
      // *** NEW: เพิ่ม Logging และจัดการ Error 403 โดยเฉพาะ ***
      if (status === 403) {
        console.error(`FORBIDDEN 403: การตรวจสอบสิทธิ์สำหรับ /registrations/student ล้มเหลว`);
        console.error(`คำแนะนำ: ตรวจสอบว่า Backend API หลักอนุญาตให้ Role Student (ID 1) เข้าถึง และปฏิเสธ Role Staff (ID 2) หรือไม่`);
      }

      // หาก Backend ตอบกลับมาพร้อม Error (เช่น 400, 403, 404)
      return NextResponse.json(error.response.data, { status: status });
    }
    
    // ข้อผิดพลาดภายในที่ไม่คาดคิด
    return NextResponse.json({ message: 'An internal server error occurred while fetching student registrations.' }, { status: 500 });
  }
}
