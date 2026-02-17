'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LayoutDashboard, FileText, Building2, AlertCircle, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Exams', href: '/admin/exams', icon: FileText },
    { name: 'Entities', href: '/admin/entities', icon: Building2 },
    { name: 'Issues', href: '/admin/issues', icon: AlertCircle },
];

export default function AdminNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin/login');
    };

    if (pathname === '/admin/login') return null;

    return (
        <div className="flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-[#003366] text-white">
            <div className="flex h-16 shrink-0 items-center px-6 font-bold text-xl">
                Radiology Hub
            </div>
            <nav className="flex flex-1 flex-col px-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive ? 'bg-[#004488] text-white' : 'text-gray-300 hover:bg-[#004488] hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                        >
                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Back to Portal Link */}
            <div className="mt-auto border-t border-[#004488]">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-[#004488] hover:text-white transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">Back to Portal</span>
                </Link>
            </div>

            {/* Sign Out */}
            <div className="p-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-300 hover:bg-[#004488] hover:text-white"
                >
                    <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                    Sign out
                </button>
            </div>
        </div>
    );
}
