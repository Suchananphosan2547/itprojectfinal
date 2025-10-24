import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

    const endpoint = method === 'DELETE' ? 'delete-manager' : 'update-manager';
    const targetUrl = `${EXTERNAL_API_URL}/${endpoint}/${managerId}`;

    console.log(`[PROXY] Attempting to ${method} to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, fetchOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
            console.error(`[PROXY] Error from backend: ${response.status}`, errorData);
            return NextResponse.json(errorData, { status: response.status });
        }

        if (method === 'DELETE' && response.ok) {
            return NextResponse.json({ message: "Manager marked as deleted." }, { status: 200 });
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
