import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Handles DELETE requests to unregister from a project.
 * The project ID is extracted from the URL parameters.
 * @param {Request} req The incoming request object.
 * @param {Object} context The context object containing URL parameters.
 */
export async function DELETE(req, { params }) {
  try {
    const { projectId } = params;
    const accessToken = req.headers.get('authorization');
    const response = await axios.delete(`${API_BASE_URL}/project/unregister/${projectId}`, {
      headers: {
        'Authorization': accessToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Unregister DELETE Error:', error.message);
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
