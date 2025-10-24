import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const fiscal_id = searchParams.get('fiscal_id') || '';
    const plan_id = searchParams.get('plan_id') || '';
    const program_type = searchParams.get('program_type') || '';

    // Get the access token from the request header or cookies
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    // Construct the URL with all the filter parameters
    const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    if (search) url.searchParams.append('search', search);
    if (fiscal_id) url.searchParams.append('fiscal_id', fiscal_id);
    if (plan_id) url.searchParams.append('plan_id', plan_id);
    if (program_type) url.searchParams.append('program_type', program_type);

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
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}