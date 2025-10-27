import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

async function proxyRequest(request, managerId, method) {
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

    if (method === 'PUT') {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
    }

    const targetUrl = `${EXTERNAL_API_URL}/manager/${managerId}`;

    console.log(`[PROXY] Attempting to ${method} to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, fetchOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
            console.error(`[PROXY] Error from backend: ${response.status}`, errorData);
            return NextResponse.json(errorData, { status: response.status });
        }

        if (method === 'DELETE' && response.ok) {
            if (response.status === 204) {
                return new Response(null, { status: 204 });
            }
            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error(`[PROXY] Failed to connect to ${targetUrl}. Error:`, error.message);
        return NextResponse.json({ message: `Service Unavailable: Could not connect to the backend service at ${EXTERNAL_API_URL}.` }, { status: 503 });
    }
}

export async function PUT(request, { params }) {
    return proxyRequest(request, params.manager_id, 'PUT');
}

export async function DELETE(request, { params }) {
    return proxyRequest(request, params.manager_id, 'DELETE');
}
