// D:\Project\itproject\app\api\registrations\project\[projectId]\route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

// ต้องกำหนดค่านี้ในไฟล์ .env.local หรือ .env.production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 

/**
 * @description จัดการคำขอ GET เพื่อดึงรายการการลงทะเบียนทั้งหมดของ Project ID ที่ระบุ
 * @param {Request} request 
 * @param {object} context - มี property ชื่อ params ที่มีค่า projectId
 */
export async function GET(request, context) {
    // 1. ดึงค่า Project ID จาก Dynamic Segment ของ URL (เช่น '5')
    const projectId = context.params.projectId; 
    
    // 2. ดึง Authorization Token จาก Header
    const accessToken = request.headers.get('authorization'); 
    
    if (!API_BASE_URL) {
        console.error('Environment variable NEXT_PUBLIC_API_BASE_URL is not set.');
        return NextResponse.json(
            { message: 'Server configuration error: API base URL is missing.' }, 
            { status: 500 }
        );
    }

    if (!accessToken) {
        return NextResponse.json(
            { message: 'Authorization token not provided.' }, 
            { status: 401 }
        );
    }
    
    // 3. สร้าง URL ปลายทางของ Backend API จริง
    // สมมติว่า Backend ใช้ Path: /registrations/project/{projectId}
    const backendUrl = `${API_BASE_URL}/registrations/project/${projectId}`;

    try {
        // 4. ส่งคำขอ GET ไปยัง Backend API จริง พร้อมส่งต่อ Token
        const response = await axios.get(backendUrl, {
            headers: {
                'Authorization': accessToken, 
            },
        });

        // 5. ส่งข้อมูลและสถานะที่ได้รับจาก Backend กลับไปยัง Client
        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`API Proxy Error to ${backendUrl}:`, error.message);
        
        if (axios.isAxiosError(error) && error.response) {
            // ส่งต่อ Error status code และ body ที่ได้จาก Backend
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        
        return NextResponse.json(
            { message: 'An internal server error occurred during data fetching.' }, 
            { status: 500 }
        );
    }
}