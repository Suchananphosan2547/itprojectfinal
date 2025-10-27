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
        const { searchParams } = new URL(request.url);
        
        // สร้าง URL สำหรับเรียก API หลังบ้านพร้อมกับ params ทั้งหมด
        const backendUrl = `${EXTERNAL_API_URL}/my-project?${searchParams.toString()}`;
        
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error("Proxy GET /my-project Error:", error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}