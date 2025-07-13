'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function NavbarSelector() {
  const pathname = usePathname();
  const isAdminLogin = pathname === '/admin';
  const isAdminSubPage = pathname.startsWith('/admin')&& pathname !== '/admin';

  // return isAdminRoute ? <AdminNavbar /> : <Navigation />;
  if (isAdminLogin) {
    return null; //  No navbar on admin login
  }
  if (isAdminSubPage) {
    return <AdminNavbar />; //  Admin navbar on dashboard or other subroutes
  }
  return <Navigation />;
}
