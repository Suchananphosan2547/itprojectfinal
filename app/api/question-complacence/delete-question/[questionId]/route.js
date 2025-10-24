// /app/api/question-complacence/[id]/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ฟังก์ชันดึง Access Token (เหมือนเดิม)
async function getAccessToken(request) {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
        const cookieStore = cookies();
        accessToken = cookieStore.get('accessToken')?.value;
        if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    return accessToken;
}

// ✅ PATCH /api/question-complacence/[id] สำหรับ Soft Delete
export async function DELETE(req, { params }) { // เปลี่ยนจาก DELETE เป็น PATCH
    try {
        const accessToken = await getAccessToken(req);
        if (!accessToken) {
            return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
        }

        const { id } = params; 

        if (!id) {
            return NextResponse.json({ message: 'Missing question ID.' }, { status: 400 });
        }
        
        // 💡 เราต้องส่ง Payload ไปบอก Backend ว่าให้เปลี่ยน status เป็น 'unused'
        const payload = {
            questions_status: 'unused'
        };

        // ⭐ เปลี่ยนเป็น axios.patch และเปลี่ยน URL ให้สอดคล้องกับการอัปเดตสถานะ
        const response = await axios.patch(
            `${API_BASE_URL}/question-complacence/delete-question/${questionId}`, // สมมติว่า Backend API สำหรับอัปเดตสถานะคือ /update-status/{id}
            payload,
            {
                headers: { Authorization: accessToken },
            }
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('API Question Complacence PATCH Error (Soft Delete):', error.message);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// ⚠️ ควรลบฟังก์ชัน DELETE เก่าทิ้งไป หรือเปลี่ยนชื่อไฟล์ route ใหม่ให้สื่อความหมายมากขึ้น