import { NextResponse } from 'next/server';

// Define role-based permissions
// Map role_id to an array of allowed paths.
// Adjust these paths and role_ids according to your application's requirements.
const rolePermissions = {
  1: ['/home', '/api/news', '/api/sidebar' , '/project' , '/myproject' , '/complacence'],
  2: ['/home', '/news', '/manageuser', '/manager', '/api/news', '/api/manager', '/api/faculty', '/api/major', '/api/users', '/api/sidebar' , '/project' , '/complacence' , '/dashboard' , '/documents'],
  3: ['/manageuser', '/plan', '/fiscal', '/api/users', '/api/roles', '/api/faculty', '/api/major', '/api/fiscal-year', '/api/plan', '/api/sidebar' , '/adminhome' , '/adminproject'],
};

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 1000; // max requests per window

// Security functions
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip);
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  return true; // Request allowed
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

function validateApiRequest(request) {
  const { pathname } = request.nextUrl;
  
  // Skip validation for certain API endpoints
  if (pathname.startsWith('/api/auth/verify') || pathname.startsWith('/api/login')) {
    return { allowed: true };
  }

  // Rate limiting
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    };
  }

  // Check referer and origin for API requests
  if (pathname.startsWith('/api/')) {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');

    // Define allowed domains
    const allowedDomains = [
      'http://localhost:1237',
      'https://localhost:1237',
      'http://pro.anasaki.live',
      'https://pro.anasaki.live',
      'http://127.0.0.1:1237', 
    ];

    // Check if request is from allowed domain
    // Allow requests without referer for browser requests (common for direct API calls)
    const isAllowedOrigin = !referer || !origin || allowedDomains.some(domain => 
      (referer && referer.startsWith(domain)) || 
      (origin && allowedDomains.includes(origin))
    );

    // Check for suspicious user agents
    const suspiciousUserAgents = [
      'curl', 'wget', 'python', 'postman', 'insomnia', 'thunder client'
    ];
    
    const isSuspiciousUserAgent = userAgent && 
      suspiciousUserAgents.some(agent => 
        userAgent.toLowerCase().includes(agent.toLowerCase())
      ) && !userAgent.toLowerCase().includes('mozilla');

    // Block requests from suspicious sources
    if (!isAllowedOrigin || isSuspiciousUserAgent) {
      console.warn(`Blocked API request from: ${referer || origin}, User-Agent: ${userAgent}`);
      return {
        allowed: false,
        response: NextResponse.json(
          { 
            message: 'Access denied. This API can only be accessed from authorized domains.',
            error: 'FORBIDDEN'
          }, 
          { status: 403 }
        )
      };
    }
  }

  return { allowed: true };
}

export async function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const loginUrl = new URL('/', request.url);
  const currentPath = request.nextUrl.pathname;

  // Allow access to login page, reset password pages, and API routes without token verification
  if (currentPath === '/' || currentPath.startsWith('/api') || currentPath.startsWith('/resetpassword')) {
    // Validate API requests for security
    if (currentPath.startsWith('/api/')) {
      const validation = validateApiRequest(request);
      if (!validation.allowed) {
        return validation.response;
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  // Directly use the backend API for verification
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!API_BASE_URL) {
    console.error("FATAL: NEXT_PUBLIC_API_BASE_URL environment variable is not set.");
    return NextResponse.redirect(loginUrl);
  }

  const verifyApiUrl = `${API_BASE_URL}/auth/verify`;
    const sidebarApiUrl = `${API_BASE_URL}/sidebar`; // Define sidebar URL here

  try {
    // Fetch user verification and sidebar data concurrently for improved performance
    const [verifyResponse, sidebarResponse] = await Promise.all([
      fetch(verifyApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }),
      fetch(sidebarApiUrl, { // Fetch sidebar concurrently
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    ]);

    // Handle verifyResponse first
    if (!verifyResponse.ok) {
      const errorBody = await verifyResponse.text();
      console.error(`Token verification failed with status: ${verifyResponse.status}`);
      console.error(`Backend response: ${errorBody}`);
      return NextResponse.redirect(loginUrl);
    }

    const { user } = await verifyResponse.json();
    const userRoleId = user.role_id;

    const allowedPaths = rolePermissions[userRoleId];
    if (!allowedPaths || !allowedPaths.includes(currentPath)) {
      console.warn(`User with role_id ${userRoleId} attempted to access unauthorized path: ${currentPath}`);
      return NextResponse.redirect(loginUrl);
    }

    // Handle sidebarResponse after successful verification and authorization check

    // Handle sidebarResponse after successful verification and authorization check
    if (!sidebarResponse.ok) {
        console.error(`Failed to fetch sidebar data. Status: ${sidebarResponse.status}`);
        // Proceed without sidebar data, or redirect to login
        return NextResponse.redirect(loginUrl);
    }

    const sidebarData = await sidebarResponse.json();

    const requestHeaders = new Headers(request.headers);
    const encodedUser = Buffer.from(JSON.stringify(user)).toString('base64');
    const encodedSidebar = Buffer.from(JSON.stringify(sidebarData.data)).toString('base64');

    requestHeaders.set('x-user-data', encodedUser);
    requestHeaders.set('x-sidebar-data', encodedSidebar);

    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return addSecurityHeaders(nextResponse);

  } catch (error) {
    console.error("Middleware could not connect to the backend API:", error);
    return NextResponse.redirect(loginUrl);
  }
}

// ส่วนของ matcher ยังคงเดิม
export const config = {
  matcher: [
    '/',
    '/fiscal',
    '/home',
    '/plan',
    '/manageuser',
    '/manager',
    '/news',
    '/project',
    '/myproject',
    '/complacence',
    '/dashboard',
    '/documents',
    '/adminhome',
    '/adminproject',
    '/resetpassword/:path*',
    '/api/:path*',
  ],
};