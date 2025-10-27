import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function GET(request, { params }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    // 1. ดึง projectId จาก URL
    const { projectId } = await params; 

    if (!projectId) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        // 2. สร้าง URL สำหรับเรียก Backend API ให้ถูกต้อง
        const backendUrl = `${EXTERNAL_API_URL}/project-report-details/${projectId}`;
        
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy GET /project-report-details/${projectId} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}