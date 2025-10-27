import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;

export async function PUT(req, { params }) {
  try {
    const { username } = params;
    let accessToken = req.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const response = await axios.put(`${API_BASE_URL}/users/${username}/activate`, {}, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`API Activate User PUT Error for ${params.username}:`, error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
