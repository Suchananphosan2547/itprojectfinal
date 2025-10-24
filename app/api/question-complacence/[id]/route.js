// /app/api/question-complacence/[id]/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ฟังก์ชันดึง Access Token
async function getAccessToken(request) {
  let accessToken = request.headers.get('authorization');
  if (!accessToken) {
    const cookieStore = cookies();
    accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) accessToken = `Bearer ${accessToken}`;
  }
  return accessToken;
}

// ✅ GET /api/question-complacence/[id]
export async function GET(req, { params }) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const { id } = await params;

    const response = await axios.get(`${API_BASE_URL}/question-complacence/${id}`, {
      headers: { Authorization: accessToken },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Question Complacence GET Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// ✅ PUT /api/question-complacence/[id]
export async function PUT(req, { params }) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const { id } = awaitparams;
    const body = await req.json();

    const response = await axios.put(`${API_BASE_URL}/question-complacence/${id}`, body, {
      headers: { Authorization: accessToken },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Question Complacence PUT Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// ✅ DELETE /api/question-complacence/[id]
export async function DELETE(req, { params }) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const { id } = await params;

    const response = await axios.delete(`${API_BASE_URL}/question-complacence/${id}`, {
      headers: { Authorization: accessToken },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Question Complacence DELETE Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
