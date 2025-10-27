import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/manager-rank`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Internal Server Error';
        return NextResponse.json({ message }, { status });
    }
}
