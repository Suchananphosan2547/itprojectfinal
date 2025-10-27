import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

// POST /api/registrations (for creating a new registration)
export async function POST(request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const response = await axios.post(`${EXTERNAL_API_URL}/registrations`, body, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        return NextResponse.json(error.response.data, { status: error.response.status });
    }
}