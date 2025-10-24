
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Handles POST requests to register for a project.
 * @param {Request} req The incoming request object.
 */
export async function POST(req) {
  try {
    const accessToken = req.headers.get('authorization');
    const body = await req.json();
    const response = await axios.post(`${API_BASE_URL}/registrations`, body, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Register POST Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
