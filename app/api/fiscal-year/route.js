import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Extract page and limit from the request URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    // Construct the URL with pagination parameters
    const url = new URL(`${process.env.API_BASE_URL}/fiscal-year`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString(), {
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
    console.error('Error fetching fiscal years:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch fiscal years' }, { status: 500 });
  }
}
