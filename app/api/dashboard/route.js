import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function GET(request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        // 1. ดึง Query Parameters ทั้งหมดจาก URL (search, fiscal_id, etc.)
        const { searchParams } = new URL(request.url);
        
        const backendUrl = `${EXTERNAL_API_URL}/dashboard`;
        
        // 2. เพิ่ม `params` เข้าไปใน config ของ axios เพื่อส่งต่อ Query Parameters
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: searchParams 
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error("Proxy GET /dashboard Error:", error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}