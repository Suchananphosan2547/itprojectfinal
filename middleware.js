import { NextResponse } from 'next/server';

// ============================
// 🔐 กำหนดสิทธิ์ของแต่ละ role
// ============================
const rolePermissions = {
  1: ['/home', '/api/home','/news', '/sidebar', '/project', '/myproject', '/complacence','/api/sidebar', '/api/fiscal-year', '/api/plan', '/api/registrations/student', 'api/complacence', '/dashboard', '/documents','/api/manager', '/api/faculty', '/api/major', '/api/users', '/api/roles', '/api/fiscal-year', '/api/plan', '/api/sidebar','api/myproject'],
  2: ['/home', '/news', '/manageuser', '/manager', '/news', '/api/manager', '/api/faculty', '/api/major', '/api/users', '/api/sidebar', '/project', '/complacence', '/dashboard', '/documents','/api/sidebar','/api/fiscal-year', '/api/plan','/api/users','api/complacence'],
  3: ['/manageuser', '/plan', '/fiscal', '/api/users', '/api/roles', '/api/faculty', '/api/major', '/api/fiscal-year', '/api/plan', '/api/sidebar'],
};

// ============================
// ⚙️ Rate Limiting
// ============================
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  const requests = rateLimitStore.get(ip) || [];
  const validRequests = requests.filter((t) => t > windowStart);
  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) return false;
  validRequests.push(now);
  rateLimitStore.set(ip, validRequests);
  return true;
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  return forwarded?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
}

// ============================
// 🧠 Security Headers
// ============================
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

// ============================
// 🧩 Safe Fetch (กัน timeout)
// ============================
async function safeFetch(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    console.error(`❌ Fetch failed: ${url}`, err.message);
    return null;
  }
}

// ============================
// 🧱 API Request Validation
// ============================
function validateApiRequest(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth/verify') || pathname.startsWith('/api/login')) {
    return { allowed: true };
  }

  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    return {
      allowed: false,
      response: NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 }),
    };
  }

  if (pathname.startsWith('/api/')) {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');

    const allowedDomains = [
      'http://localhost:1237',
      'https://localhost:1237',
      'http://127.0.0.1:1237',
      'http://pro.anasaki.live',
      'https://pro.anasaki.live',
    ];

    const isAllowedOrigin =
      !referer ||
      !origin ||
      allowedDomains.some((d) => (referer && referer.startsWith(d)) || (origin && allowedDomains.includes(origin)));

    const suspiciousUserAgents = ['curl', 'wget', 'python', 'postman', 'insomnia', 'thunder client'];
    const isSuspicious = userAgent && suspiciousUserAgents.some((a) => userAgent.toLowerCase().includes(a)) && !userAgent.toLowerCase().includes('mozilla');

    if (!isAllowedOrigin || isSuspicious) {
      console.warn(`⚠️ Blocked API: ${referer || origin}, UA: ${userAgent}`);
      return {
        allowed: false,
        response: NextResponse.json({ message: 'Access denied. Unauthorized domain or client.' }, { status: 403 }),
      };
    }
  }
  return { allowed: true };
}

// ============================
// 🚀 Middleware หลัก
// ============================
export async function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const loginUrl = new URL('/', request.url);
  const currentPath = request.nextUrl.pathname;

  // อนุญาตให้เข้าหน้า login, resetpassword, api ได้โดยไม่ต้องตรวจ token
  if (currentPath === '/' || currentPath.startsWith('/resetpassword') || currentPath.startsWith('/api')) {
    const validation = validateApiRequest(request);
    if (!validation.allowed) return validation.response;
    return NextResponse.next();
  }

  // ไม่มี token → redirect ไปหน้า login
  if (!token) return NextResponse.redirect(loginUrl);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!API_BASE_URL) {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL is not set.');
    return NextResponse.redirect(loginUrl);
  }

  const verifyApiUrl = `${API_BASE_URL}/auth/verify`;
  const sidebarApiUrl = `${API_BASE_URL}/sidebar`;

  try {
    // ✅ เรียก verify และ sidebar พร้อมกัน
    const [verifyRes, sidebarRes] = await Promise.all([
      safeFetch(verifyApiUrl, { headers: { Authorization: `Bearer ${token}` } }),
      safeFetch(sidebarApiUrl, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    // ตรวจสอบ token หมดอายุ
    if (!verifyRes || verifyRes.status === 401) {
      console.warn('🔒 Token expired or verify failed');
      return NextResponse.redirect(loginUrl);
    }

    const verifyData = verifyRes.ok ? await verifyRes.json() : { user: null };
    const user = verifyData?.user;
    const roleId = user?.role_id;

    // ตรวจ role-based access
    const allowedPaths = rolePermissions[roleId];
    if (!allowedPaths || !allowedPaths.includes(currentPath)) {
      console.warn(`🚫 Unauthorized access (role_id ${roleId}) to ${currentPath}`);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Sidebar — ถ้า fetch ไม่ได้ให้ fallback
    let sidebarData = [];
    if (sidebarRes && sidebarRes.ok) {
      const sidebarJson = await sidebarRes.json().catch(() => ({}));
      sidebarData = sidebarJson?.data || [];
    } else {
      console.warn(`⚠️ Sidebar fetch failed (${sidebarRes?.status || 'timeout'}) — using empty sidebar`);
    }

    // 🔒 Encode user + sidebar
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-data', Buffer.from(JSON.stringify(user || {})).toString('base64'));
    requestHeaders.set('x-sidebar-data', Buffer.from(JSON.stringify(sidebarData)).toString('base64'));

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('💥 Middleware error:', error.message);
    // ❗ไม่ redirect ถ้า backend ล่ม — ป้องกันเด้ง login
    return NextResponse.next();
  }
}

// ============================
// 🧭 Matcher
// ============================
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
