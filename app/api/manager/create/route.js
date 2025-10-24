import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request) {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${EXTERNAL_API_URL}/create-manager`, {
            method: 'POST',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error("Proxy POST /create-manager Error:", error);
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}
