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
        // --- ⚠️ จุดที่แก้ไข ---
        // เปลี่ยน URL ให้เรียกไปยัง /project-data และลบ searchParams ที่ไม่ได้ใช้ออก
        const backendUrl = `${EXTERNAL_API_URL}/project-complacence`;
        
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        // ปรับแก้ Error message ให้ตรงกับชื่อ endpoint
        console.error("Proxy GET /project-data Error:", error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}