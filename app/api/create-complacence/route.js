import { NextResponse } from 'next/server';
import axios from 'axios';

// Base URL สำหรับ Backend ภายนอก (อ่านจาก .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Handles POST requests to /api/create-complacence.
 * ทำหน้าที่เป็น Proxy ส่งต่อคำขอสร้างแบบประเมินไปยัง Backend ภายนอก
 * ต้องถูกวางไว้ในตำแหน่ง: app/api/create-complacence/route.js
 *
 * @param {Request} req - The incoming Next.js Request object.
 */
export async function POST(req) {
    try {
        // 1. ตรวจสอบและดึง Access Token จาก Header
        const accessToken = req.headers.get('authorization');

        if (!accessToken) {
            return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
        }

        // 2. อ่าน Request Body เป็น JSON (คาดหวัง { project_id: number })
        const requestBody = await req.json();

        // 3. ตรวจสอบข้อมูลเบื้องต้น
        if (!requestBody.project_id) {
            return NextResponse.json({ message: 'Missing project_id in request body.' }, { status: 400 });
        }

        // 4. Endpoint ของ External Backend (สมมติว่าเป็น /assessments/create-complacence)
        const externalEndpoint = `${API_BASE_URL}/create-complacence`;

        // 5. ส่งต่อคำขอไปยัง Backend API ภายนอก
        const response = await axios.post(externalEndpoint, requestBody, {
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json', // บอก Backend ว่าเราส่ง JSON
            },
        });

        // 6. ส่งต่อ Response จาก Backend กลับไปยัง Frontend
        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error('API Create Complacence POST Error:', error.message);
        
        // จัดการข้อผิดพลาดจาก External Backend
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        
        // จัดการข้อผิดพลาดภายใน (เช่น Network Error, Unreachable Backend)
        return NextResponse.json({ message: 'An internal server error occurred during proxy request.' }, { status: 500 });
    }
}
