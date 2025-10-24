import { headers } from 'next/headers';
import LayoutWrapper from '../components/LayoutWrapper';

export default async function MainLayout({ children }) {
  const heads = await headers();
  const encodedUserData = heads.get('x-user-data');
  const encodedSidebarData = heads.get('x-sidebar-data');

  const user = encodedUserData ? JSON.parse(Buffer.from(encodedUserData, 'base64').toString('utf-8')) : null;
  const sidebarItems = encodedSidebarData ? JSON.parse(Buffer.from(encodedSidebarData, 'base64').toString('utf-8')) : [];

  return (
    <LayoutWrapper user={user} sidebarItems={sidebarItems}>
      {children}
    </LayoutWrapper>
  );
}