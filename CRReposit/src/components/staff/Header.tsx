'use client';
import Link from 'next/link';
import EntitySelector from './EntitySelector';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [term, setTerm] = useState(searchParams.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <header className="bg-[#003366] text-white shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Radiology Resources
                </Link>

                {/* Center: Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                    <form onSubmit={handleSearch} className="w-full relative">
                        <input
                            type="text"
                            placeholder="Search by exam, modality, or CPT..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border-none bg-[#004488] text-white placeholder-gray-300 focus:ring-2 focus:ring-white/50 text-sm"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300 pointer-events-none" />
                    </form>
                </div>

                {/* Right: Entity Selector and Admin Link */}
                <div className="flex items-center gap-4">
                    <EntitySelector />
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#7AB800] hover:bg-[#6AA700] text-white text-sm font-medium transition-colors"
                        title="Supervisor Interface"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden lg:inline">Admin</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
