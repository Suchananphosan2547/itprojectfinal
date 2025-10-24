import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
          const awaitedParams = await params;
      const { projectId } = awaitedParams; 

    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/project-report-details/${projectId}`, {
      headers: { 'Authorization': accessToken },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching project report details:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch project report details' }, { status: 500 });
  }
}
