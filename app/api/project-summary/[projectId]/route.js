import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  try {
    const { projectId } = params;
    const reportData = await request.json();

    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project-summary/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating project summary:', error);
    return NextResponse.json({ message: error.message || 'Failed to update project summary' }, { status: 500 });
  }
}
