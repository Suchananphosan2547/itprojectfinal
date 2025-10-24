import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req) {
  try {
    const accessToken = req.headers.get('authorization');
    const projectId = req.nextUrl.pathname.split('/').pop(); // เปลี่ยน newsId เป็น projectId

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const formData = await req.formData();

    // เปลี่ยน URL จาก /news เป็น /projects
    const response = await axios.put(`${API_BASE_URL}/project/${projectId}`, formData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    // เปลี่ยนข้อความ Error ให้สื่อความหมายมากขึ้น
    console.error('API Project PUT Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const accessToken = req.headers.get('authorization');
    const projectId = req.nextUrl.pathname.split('/').pop(); // เปลี่ยน newsId เป็น projectId

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    // เปลี่ยน URL จาก /news เป็น /projects
    const response = await axios.delete(`${API_BASE_URL}/project/${projectId}`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    // เปลี่ยนข้อความ Error ให้สื่อความหมายมากขึ้น
    console.error('API Project DELETE Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}