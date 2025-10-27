import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function PUT(request, { params }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    // 1. ดึง projectId จาก URL
    const { projectId } = params; 
    if (!projectId) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        // 2. อ่านข้อมูล JSON จาก body ที่ส่งมาจาก Frontend
        const body = await request.json();
        
        // 3. สร้าง URL สำหรับเรียก Backend API ให้ถูกต้อง
        const backendUrl = `${EXTERNAL_API_URL}/project-summary/${projectId}`;
        
        // 4. ใช้ axios.put เพื่อส่งข้อมูล (body) ไปยัง Backend
        const response = await axios.put(backendUrl, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy PUT /project-summary/${projectId} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}