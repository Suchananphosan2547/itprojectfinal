import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL;

export async function PUT(req, { params }) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const { username } = params; // Get username from dynamic route segment

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const requestBody = await req.json();

    const response = await axios.put(`${API_BASE_URL}/users/${username}`, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Update Account PUT Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const { username } = params; // Get username from dynamic route segment

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const response = await axios.delete(`${API_BASE_URL}/users/${username}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Delete Account DELETE Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
