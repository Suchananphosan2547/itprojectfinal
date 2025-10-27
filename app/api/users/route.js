import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req) {
  try {
    let accessToken = req.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });

    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 10;
    const role = searchParams.get('role') || '';
    const faculty_id = searchParams.get('faculty_id') || '';
    const major_id = searchParams.get('major_id') || '';

    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': accessToken,
      },
      params: {
        search, page, limit, role, faculty_id, major_id
      }
    });

    return NextResponse.json(usersResponse.data);
  } catch (error) {
    console.error('API Users GET Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    let accessToken = req.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const requestBody = await req.json(); // Can be single user object or array of users

    const response = await axios.post(`${API_BASE_URL}/users`, requestBody, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Create Account POST Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

