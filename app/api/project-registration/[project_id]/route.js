import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req, { params }) {
  try {
    const { projectId } = params;
    const accessToken = req.headers.get('authorization');

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required.' }, { status: 400 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const response = await axios.put(`${API_BASE_URL}/project-registration/${projectId}`, body, {
      headers: {
        Authorization: accessToken.startsWith('Bearer ')
          ? accessToken
          : `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Update Project Registration PUT Error:', error.message);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
