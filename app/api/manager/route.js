import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define the base URL for your external Express API.
// You can use an environment variable for flexibility.
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request) {
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
        // Make a request to the external API's /manager endpoint.
        const response = await fetch(`${EXTERNAL_API_URL}/manager`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json',
            },
        });

        // Get the response data from the external API.
        const data = await response.json();

        // If the external API returned an error, forward it to the client.
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // If successful, forward the data to the client.
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Proxy GET /manager Error:", error);
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 }); // Service Unavailable
    }
}
