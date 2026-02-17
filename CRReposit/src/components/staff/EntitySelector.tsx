'use client';
import { useEntity } from '@/context/EntityContext';
import { ChevronDown, Building2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function EntitySelector() {
    const { currentEntity, entities, selectEntity } = useEntity();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentEntity && entities.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors border border-white/20"
            >
                {currentEntity?.logoUrl ? (
                    <img src={currentEntity.logoUrl} alt={currentEntity.name} className="h-5 w-5 rounded-full bg-white object-contain" />
                ) : (
                    <Building2 className="h-5 w-5" />
                )}
                <span className="font-medium text-sm hidden sm:block">
                    {currentEntity?.name || 'Select Entity'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="py-1">
                            {entities.map((entity) => (
                                <button
                                    key={entity.id}
                                    onClick={() => {
                                        selectEntity(entity);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        'flex w-full items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100',
                                        currentEntity?.id === entity.id ? 'bg-gray-50 text-[#003366] font-semibold' : 'text-gray-700'
                                    )}
                                >
                                    {entity.logoUrl ? (
                                        <img src={entity.logoUrl} alt={entity.name} className="h-6 w-6 rounded-full bg-gray-100 object-contain" />
                                    ) : (
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    )}
                                    {entity.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
