import { Suspense } from 'react';
import { EntityProvider } from '@/context/EntityContext';
import Header from '@/components/staff/Header';

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <EntityProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Suspense fallback={
                    <header className="bg-[#003366] text-white shadow-md">
                        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                            <div className="text-xl font-bold tracking-tight">Radiology Resources</div>
                        </div>
                    </header>
                }>
                    <Header />
                </Suspense>
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
                <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Radiology Resource Hub. All rights reserved.
                </footer>
            </div>
        </EntityProvider>
    );
}
