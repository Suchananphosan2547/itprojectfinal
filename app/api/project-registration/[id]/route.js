import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

async function proxyRequest(request, id, method) {
    let accessToken = request.headers.get('authorization');
    if (!accessToken) {
      const cookieStore = await cookies();
      accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) accessToken = `Bearer ${accessToken}`;
    }
    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    const fetchOptions = {
        method: method,
        headers: {
            'Authorization': accessToken,
            'Content-Type': 'application/json',
        },
    };

    const targetUrl = `${EXTERNAL_API_URL}/project-registration/${id}`;

    console.log(`[PROXY] Attempting to ${method} to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, fetchOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
            console.error(`[PROXY] Error from backend: ${response.status}`, errorData);
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error(`[PROXY] Failed to connect to ${targetUrl}. Error:`, error.message);
        return NextResponse.json({ message: `Service Unavailable: Could not connect to the backend service at ${EXTERNAL_API_URL}.` }, { status: 503 });
    }
}

export async function PUT(request) {
    const id = request.nextUrl.pathname.split('/').pop();
    return proxyRequest(request, id, 'PUT');
}