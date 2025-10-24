// D:\Project\itproject\app\api\person-complacence\route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

// ต้องกำหนดค่านี้ในไฟล์ .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// URL ปลายทางของ Backend API จริง
const BACKEND_ENDPOINT = `${API_BASE_URL}/person-complacence`;

/**
 * @description GET: ดึงรายการการประเมินความชะล่าใจทั้งหมด
 */
export async function GET(request) {
    const accessToken = request.headers.get('authorization');

    if (!accessToken) {
        return NextResponse.json(
            { message: 'Authorization token not provided.' }, 
            { status: 401 }
        );
    }
    
    try {
        // ส่งคำขอ GET ไปยัง Backend API จริง
        const response = await axios.get(BACKEND_ENDPOINT, {
            headers: {
                'Authorization': accessToken, 
            },
        });

        // ส่งข้อมูลและสถานะที่ได้รับจาก Backend กลับไปยัง Client
        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error('API Complacence List GET Error:', error.message);
        
        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        
        return NextResponse.json(
            { message: 'An internal server error occurred during data fetching.' }, 
            { status: 500 }
        );
    }
}


export async function POST(request) {
    const accessToken = request.headers.get('authorization');

    if (!accessToken) {
        return NextResponse.json(
            { message: 'Authorization token not provided.' }, 
            { status: 401 }
        );
    }
    
    // ดึง Body ของคำขอ
    let requestBody;
    try {
        // คาดว่าข้อมูลเป็น JSON (สำหรับการสร้างใหม่)
        requestBody = await request.json(); 
    } catch (e) {
        // หากไม่ใช่ JSON ให้พยายามอ่านเป็น Text หรือ Form Data แทน
        requestBody = {}; 
    }

    try {
        // ส่งคำขอ POST ไปยัง Backend API จริง
        const response = await axios.post(BACKEND_ENDPOINT, requestBody, {
            headers: {
                'Authorization': accessToken, 
                'Content-Type': 'application/json', // ส่วนใหญ่ใช้ JSON สำหรับการสร้างข้อมูล
            },
        });

        // ส่งข้อมูลและสถานะที่ได้รับจาก Backend กลับ (ปกติคือ 201 Created)
        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error('API Complacence POST Error:', error.message);
        
        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        
        return NextResponse.json(
            { message: 'An internal server error occurred during data creation.' }, 
            { status: 500 }
        );
    }
}