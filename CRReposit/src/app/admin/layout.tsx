'use client';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import clsx from 'clsx';

function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // TEMPORARY: Disable auth check for development
    // useEffect(() => {
    //     if (!loading && !user && pathname !== '/admin/login') {
    //         router.push('/admin/login');
    //     }
    // }, [user, loading, router, pathname]);

    // if (loading) {
    //     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    // }

    // if (!user && pathname !== '/admin/login') {
    //     return null;
    // }

    const isLoginPage = pathname === '/admin/login';

    return (
        <div className="flex min-h-screen bg-gray-100">
            {!isLoginPage && <AdminNav />}
            <main className={clsx("flex-1", !isLoginPage && "pl-64")}>
                <div className="py-6 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminGuard>
                {children}
            </AdminGuard>
        </AuthProvider>
    );
}
