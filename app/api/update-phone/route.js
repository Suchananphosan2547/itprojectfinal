import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function PUT(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ message: 'ไม่พบโทเค็นการยืนยันตัวตน' }, { status: 401 });
  }

  try {
    const { phone } = await request.json();

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น' }, { status: 400 });
    }

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("ข้อผิดพลาดร้ายแรง: ไม่ได้ตั้งค่าตัวแปรสภาพแวดล้อม API_BASE_URL");
      return NextResponse.json({ message: 'ไม่ได้กำหนดค่า API base URL' }, { status: 500 });
    }

    // ส่งคำขอไปยัง Backend API
    const response = await axios.put(
      `${apiBaseUrl}/phone`,
      { phone },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // ส่งการตอบสนองจาก Backend กลับไปยัง Client
    return NextResponse.json(response.data, { status: response.status });

  } catch (error) {
    console.error('API Proxy Error (update-phone):', error);
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || 'เกิดข้อผิดพลาดจากฝั่ง Backend' },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}