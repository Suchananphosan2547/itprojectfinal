import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req) {
  try {
    const accessToken = req.headers.get('authorization');

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // Next.js 13+ App Router handles FormData directly
    const formData = await req.formData();

    const response = await axios.post(`${API_BASE_URL}/create-news`, formData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'multipart/form-data', // Axios will set boundary automatically
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Create News POST Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
