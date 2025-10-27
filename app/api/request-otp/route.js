import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req) {
  try {
    const { username } = await req.json();

    const response = await axios.post(`${API_BASE_URL}/request-otp`, { username });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('API Request OTP Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
