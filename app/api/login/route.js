import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req) {
  console.log('Login request received');
  console.log('API_BASE_URL:', API_BASE_URL);

  try {
    const { username, password } = await req.json();
    console.log('Request body:', { username, password });

    if (!username || !password) {
      console.log('Validation failed: Missing username or password');
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }

    // 1. Call the backend login endpoint
    console.log(`Attempting to log in at ${API_BASE_URL}/login`);
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
    console.log('Login response received:', loginResponse.data);

    const { user, accessToken } = loginResponse.data;

    if (!accessToken) {
      console.log('Login failed: No access token received');
      return NextResponse.json({ message: 'Login failed, no access token received.' }, { status: 401 });
    }

    // 2. Call the backend sidebar endpoint with the new token
    console.log(`Fetching sidebar data from ${API_BASE_URL}/sidebar`);
    const sidebarResponse = await axios.get(`${API_BASE_URL}/sidebar`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('Sidebar response received:', sidebarResponse.data);

    const sidebarData = sidebarResponse.data.data;

    // 3. Determine the initial page to redirect to from sidebar data
    const initialPath = sidebarData && sidebarData.length > 0 ? sidebarData[0].sidebar_path : '/home';
    console.log('Initial path determined:', initialPath);

    // 4. Create the response and set the cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user,
      initialPath,
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: false, // Changed to false to allow client-side access
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('API Login Error:', error.message);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}