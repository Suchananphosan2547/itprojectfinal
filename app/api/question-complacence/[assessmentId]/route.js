import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function GET(request, context) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    // 1. ดึง assessmentId จาก URL ที่ส่งมาจาก Frontend
    const assessmentId = context.params.assessmentId; 

    if (!assessmentId) {
        return NextResponse.json({ message: "Assessment ID is required" }, { status: 400 });
    }

    try {
        // 2. สร้าง URL สำหรับเรียก Backend API ให้ถูกต้อง
        const backendUrl = `${EXTERNAL_API_URL}/question-complacence/${assessmentId}`;
        
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        // 3. ปรับแก้ Error message ให้ตรงกับชื่อ endpoint
        console.error(`Proxy GET /question-complacence/${assessmentId} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}