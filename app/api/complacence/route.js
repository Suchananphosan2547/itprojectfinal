import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ฟังก์ชันช่วยดึง Access Token
async function getAccessToken(req) {
  let accessToken = req.headers.get('authorization');
  if (!accessToken) {
    const cookieStore = cookies();
    accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) accessToken = `Bearer ${accessToken}`;
  }
  return accessToken;
}

// GET /api/complacence
export async function GET(req) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const response = await axios.get(`${API_BASE_URL}/complacence?${queryString}`, {
      headers: { Authorization: accessToken },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (error.response) return NextResponse.json(error.response.data, { status: error.response.status });
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT /api/complacence
export async function PUT(req) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });

    const body = await req.json();
    const response = await axios.put(`${API_BASE_URL}/complacence`, body, {
      headers: { Authorization: accessToken, 'Content-Type': 'application/json' },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (error.response) return NextResponse.json(error.response.data, { status: error.response.status });
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE /api/complacence?id=123
export async function DELETE(req) {
  try {
    const accessToken = await getAccessToken(req);
    if (!accessToken) return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID is required for deletion.' }, { status: 400 });

    const response = await axios.delete(`${API_BASE_URL}/complacence/${id}`, {
      headers: { Authorization: accessToken },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    if (error.response) return NextResponse.json(error.response.data, { status: error.response.status });
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
