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
                <Header />
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
