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

    // ดึง id ของ assessment จาก URL
    const { id } = params; 

    if (!id) {
        return NextResponse.json({ message: "Assessment ID is required" }, { status: 400 });
    }

    try {
        const backendUrl = `${EXTERNAL_API_URL}/change-complacence-status/${id}`;
        
        // ใช้ axios.put และส่ง body เป็น null เพราะ endpoint นี้ไม่ต้องการ body
        const response = await axios.put(backendUrl, null, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy PUT /change-complacence-status/${id} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}