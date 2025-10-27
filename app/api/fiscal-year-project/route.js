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

    const response = await axios.get(`${API_BASE_URL}/fiscal-year-project`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // The backend returns { message: '...', data: [...] }, but the frontend expects an array.
    // We extract the 'data' property to match what the frontend component expects.
    if (response.data && Array.isArray(response.data.data)) {
        return NextResponse.json(response.data.data);
    } else {
        // If the structure is not what we expect, log it and return an empty array to prevent client-side errors.
        console.error('Unexpected backend response structure for fiscal-year-project:', response.data);
        return NextResponse.json([]);
    }

  } catch (error) {
    console.error('API Fiscal Year Project GET Error:', error.message);
    if (error.response) {
      // Forward the error response from the backend API
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    // Handle network errors or other issues
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
