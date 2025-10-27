import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  try {
    const { plan_id } = params;
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not found.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.API_BASE_URL}/active-plan/${plan_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error activating plan:', error);
    return NextResponse.json({ message: error.message || 'Failed to activate plan' }, { status: 500 });
  }
}
