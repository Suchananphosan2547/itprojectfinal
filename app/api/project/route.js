import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req) {
  try {
    const accessToken = req.headers.get('authorization');

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // เปลี่ยน URL จาก /news เป็น /projects
    const projectsResponse = await axios.get(`${API_BASE_URL}/project`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(projectsResponse.data);
  } catch (error) {
    // เปลี่ยนข้อความ Error ให้สื่อความหมายมากขึ้น
    console.error('API Project GET Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const accessToken = req.headers.get('authorization');

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const formData = await req.formData();

    // เปลี่ยน URL จาก /create-news เป็น /create-project
    const response = await axios.post(`${API_BASE_URL}/project`, formData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    // เปลี่ยนข้อความ Error ให้สื่อความหมายมากขึ้น
    console.error('API Create Project POST Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}