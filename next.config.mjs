/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['my.ku.th','it.flas.kps.ku.ac.th'], // เพิ่มโดเมนของภาพที่คุณต้องการให้ Next.js โหลด
    },
    output: 'standalone',
    async headers() {
        return [
            {
                // Apply these headers to all routes
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://pro.anasaki.live' // หรือ '*' เพื่ออนุญาตทั้งหมด
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization, X-Requested-With'
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true'
                    }
                ]
            }
        ];
    }
};

export default nextConfig;
