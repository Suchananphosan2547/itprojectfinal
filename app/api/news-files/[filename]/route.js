import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req, { params }) {
  const { filename } = params;

  if (!filename) {
    return NextResponse.json({ message: 'Filename not provided.' }, { status: 400 });
  }

  try {
    const fileResponse = await axios.get(`${API_BASE_URL}/uploads/news/${filename}`, {
      responseType: 'arraybuffer', // Important for binary data
    });

    const headers = new Headers();
    headers.set('Content-Type', fileResponse.headers['content-type']);
    headers.set('Content-Disposition', fileResponse.headers['content-disposition'] || `attachment; filename="${filename}"`);

    return new NextResponse(fileResponse.data, { status: 200, headers });
  } catch (error) {
    console.error(`Error fetching news file ${filename}:`, error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred while fetching the file.' }, { status: 500 });
  }
}
