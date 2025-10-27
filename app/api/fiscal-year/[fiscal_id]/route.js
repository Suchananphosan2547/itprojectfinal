import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  const { fiscal_id } = params;
  try {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.API_BASE_URL}/update-fiscal-year/${fiscal_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error updating fiscal year ${fiscal_id}:`, error);
    return NextResponse.json({ message: error.message || `Failed to update fiscal year ${fiscal_id}` }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { fiscal_id } = params;
  try {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token not provided.' }, { status: 401 });
    }

    const response = await fetch(`${process.env.API_BASE_URL}/delete-fiscal-year/${fiscal_id}`, {
      method: 'DELETE',
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
    console.error(`Error deleting fiscal year ${fiscal_id}:`, error);
    return NextResponse.json({ message: error.message || `Failed to delete fiscal year ${fiscal_id}` }, { status: 500 });
  }
}
