import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const response = await axios.get(`${API_BASE_URL}/plan-project`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.data && Array.isArray(response.data.data)) {
        return NextResponse.json(response.data.data);
    } else {
        console.error('Unexpected backend response structure for plan-project:', response.data);
        return NextResponse.json([]);
    }

  } catch (error) {
    console.error('API Plan Project GET Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
