import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req) {
  try {
    const accessToken = req.headers.get('authorization');
    const newsId = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const formData = await req.formData();

    const response = await axios.put(`${API_BASE_URL}/news/${newsId}`, formData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API News PUT Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const accessToken = req.headers.get('authorization');
    const newsId = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const response = await axios.delete(`${API_BASE_URL}/news/${newsId}`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API News DELETE Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
