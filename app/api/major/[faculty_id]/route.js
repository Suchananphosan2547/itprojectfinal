import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  const { faculty_id } = await params;

  try {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }

    if (!accessToken) {
      return NextResponse.json({ message: 'Authorization token not provided.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.API_BASE_URL}/major/${faculty_id}`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error fetching majors for faculty ${faculty_id}:`, error);
    return NextResponse.json({ message: `Failed to fetch majors for faculty ${faculty_id}` }, { status: 500 });
  }
}
