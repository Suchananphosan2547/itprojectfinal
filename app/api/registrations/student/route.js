import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

// GET /api/registrations/student (get projects a student is registered for)
export async function GET(request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const response = await axios.get(`${EXTERNAL_API_URL}/project/registrations/student`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        return NextResponse.json(error.response.data, { status: error.response.status });
    }
}