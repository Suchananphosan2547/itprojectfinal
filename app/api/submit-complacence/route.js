import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function POST(request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        // 1. อ่านข้อมูล JSON (assessment_id, answers) จาก body
        const body = await request.json();
        
        // 2. กำหนด URL ของ Backend ให้ถูกต้อง
        const backendUrl = `${EXTERNAL_API_URL}/submit-complacence`;
        
        // 3. ใช้ axios.post เพื่อส่งข้อมูล (body) ไปยัง Backend
        const response = await axios.post(backendUrl, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error("Proxy POST /submit-complacence Error:", error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}