import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

// GET /api/registrations/:projectId (ดึงรายชื่อผู้ลงทะเบียน)
export async function GET(request, { params }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;

    try {
        const response = await axios.get(`${EXTERNAL_API_URL}/registrations/${projectId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: "An internal server error occurred" };
        return NextResponse.json(data, { status });
    }
}

// DELETE /api/registrations/:projectId (ยกเลิกการลงทะเบียน)
export async function DELETE(request, { params }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;

    try {
        const response = await axios.delete(`${EXTERNAL_API_URL}/registrations/${projectId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: "An internal server error occurred" };
        return NextResponse.json(data, { status });
    }
}