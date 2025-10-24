import { NextResponse } from 'next/server';
import axios from 'axios';

// ✅ ป้องกันปัญหา Caching: บังคับให้ Route Handler นี้ทำงานแบบ Dynamic (Server-side execution) เสมอ
export const dynamic = 'force-dynamic'; 

// --- ตัวแปรและฟังก์ชันช่วยเหลือ (Helper Functions) ---

// *********** ปรับเปลี่ยนตามค่าจริงใน Environment Variables ของคุณ ***********
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// *************************************************************************

// ฟังก์ชันจำลอง/ช่วยเหลือสำหรับดึง Bearer Token จาก Header
function extractBearerToken(req) {
  // ใน App Router ใช้ req.headers.get()
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // ส่งคืนเป็นสตริงเต็ม: "Bearer <token>"
    return authHeader; 
  }
  return null;
}

// --- Route Handler สำหรับ GET Request ---

/**
 * Handles GET requests for /api/registrations/project/[projectId]
 * @param {Request} req The incoming request object
 * @param {{ params: { projectId: string } }} context The context object containing route parameters
 * @returns {Promise<NextResponse>}
 */
export async function GET(req, { params }) {
  try {
    // 1. Authorization: ดึง Bearer Token
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // 2. ✅ FIX: ดึง Dynamic Parameter
    // ต้องแน่ใจว่าชื่อตัวแปร { projectId } ตรงกับชื่อโฟลเดอร์ [projectId]
    const { projectId } = await params; 

    // 3. Validation Check (ที่เคยเกิด 400 Bad Request)
    if (!projectId) {
      console.error('API Error: projectId parameter is missing from params object.', params);
      return NextResponse.json({ message: 'Project ID is required.' }, { status: 400 });
    }

    // 4. Make Request to External API
    // ใช้ projectId ที่ดึงมาได้อย่างถูกต้องในการเรียก API ภายนอก
    const externalApiUrl = `${API_BASE_URL}/registrations/project/${projectId}`;
    
    // console.log(`Proxying request to: ${externalApiUrl}`); // ใช้สำหรับ Debug
    
    const response = await axios.get(externalApiUrl, {
      headers: { 
        // ส่ง Bearer Token ที่ดึงมาจาก Client ไปยัง External API
        Authorization: accessToken 
      },
      // หากจำเป็นต้องให้การเรียก API ภายนอกไม่ถูกแคชด้วย
      // cache: 'no-store' 
    });

    // 5. Success Response: ส่งข้อมูลจาก External API กลับไป
    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('API Registrations Project GET Error:', error.message);
    
    // 6. Error Handling: ส่งต่อ Error จาก External API
    if (error.response) {
      // ส่ง status code และ body ที่ External API ตอบกลับมา
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    
    // 7. Generic Internal Server Error
    return NextResponse.json({ message: 'An internal server error occurred in the proxy.' }, { status: 500 });
  }
}