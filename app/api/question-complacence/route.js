import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ตรวจสอบให้แน่ใจว่าตัวแปรสภาพแวดล้อมนี้ถูกกำหนดไว้
const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * [POST] /api/question-complacence
 * ทำหน้าที่เป็น Proxy ส่งต่อคำขอไปยัง External API เพื่อสร้าง/บันทึกคำถาม
 */
export async function POST(request) {
    // 1. 🛡️ การตรวจสอบและดึง Access Token
    let accessToken = request.headers.get('authorization');
    
    // ถ้าไม่พบใน Header ให้ลองหาใน Cookie (ไม่ต้องมี await หน้า cookies())
    if (!accessToken) {
        const cookieStore = cookies();
        const tokenValue = cookieStore.get('accessToken')?.value;
        if (tokenValue) {
            accessToken = `Bearer ${tokenValue}`;
        }
    }

    // 2. 🛑 การตรวจสอบสิทธิ์
    if (!accessToken) {
        return NextResponse.json(
            { message: "Authorization token not provided" }, 
            { status: 401 }
        );
    }

    // 3. 🎯 ตรวจสอบ URL ภายนอก
    if (!EXTERNAL_API_BASE_URL) {
        console.error("ENVIRONMENT ERROR: NEXT_PUBLIC_API_BASE_URL is not set.");
        return NextResponse.json(
            { message: "Server configuration error: External API URL is missing." },
            { status: 500 }
        );
    }

    try {
        // 4. 🎣 ดึงข้อมูล Body
        const body = await request.json();

        // 5. 🚀 ส่งคำขอไปยัง External API
        // สมมติว่า External API สำหรับฟังก์ชันนี้คือ /question-complacence
        const externalResponse = await fetch(`${EXTERNAL_API_BASE_URL}/question-complacence`, {
            method: 'POST',
            headers: {
                // ส่งต่อ Authorization token ที่ดึงมา
                'Authorization': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // 6. 📩 ประมวลผลการตอบกลับจาก External API
        let externalData = {};
        try {
            externalData = await externalResponse.json();
        } catch (e) {
            // กรณีที่ External API ไม่ได้ตอบกลับด้วย JSON (เช่น 500 HTML error)
            console.error("External API did not return JSON. Status:", externalResponse.status);
            return NextResponse.json(
                { message: "External API returned an unreadable response." },
                { status: externalResponse.status || 500 }
            );
        }

        // 🎯 ส่ง Response กลับไปยัง Client ด้วยสถานะและข้อมูลเดิม
        return NextResponse.json(externalData, { 
            status: externalResponse.status 
        });

    } catch (error) {
        // 7. ❌ การจัดการข้อผิดพลาด (เช่น การเชื่อมต่อล้มเหลว, JSON Parse error ในฝั่ง Next.js)
        // ข้อผิดพลาดนี้เป็นสาเหตุของ 500 Internal Server Error ที่คุณเจอในคอนโซล
        console.error("Proxy POST /question-complacence Error:", error);
        
        return NextResponse.json(
            { 
                message: 'Internal Server Error: Failed to process request or connect to the external API.',
                // error_detail: error.message // สามารถเปิดเพื่อดีบักใน Development
            }, 
            { status: 500 }
        );
    }
}