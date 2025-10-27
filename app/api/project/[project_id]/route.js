import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const EXTERNAL_API_URL = process.env.API_BASE_URL;

export async function GET(request, { params }) {
    const { project_id } = params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        const response = await axios.get(`${EXTERNAL_API_URL}/project/${project_id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy GET /project/${project_id} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}

export async function PUT(request, { params }) {
    const { project_id } = params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        const formData = await request.formData();

        const response = await axios.put(`${EXTERNAL_API_URL}/project/${project_id}`, formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy PUT /project/${project_id} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}

export async function PATCH(request, { params }) {
    const { project_id } = params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        const body = await request.json(); // Get JSON body from frontend

        const response = await axios.patch(`${EXTERNAL_API_URL}/project/${project_id}`, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json', // Ensure correct content type for JSON body
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy PATCH /project/${project_id} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}


export async function DELETE(request, { params }) {
    const { project_id } = params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: "Authorization token not provided" }, { status: 401 });
    }

    try {
        const response = await axios.delete(`${EXTERNAL_API_URL}/project/${project_id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error) {
        console.error(`Proxy DELETE /project/${project_id} Error:`, error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({ message: 'Failed to connect to the external API service.' }, { status: 503 });
    }
}
