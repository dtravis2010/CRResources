'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entity } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';

export default function EntitiesPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'entities'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Entity[];
            setEntities(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this entity?')) {
            await deleteDoc(doc(db, 'entities', id));
        }
    };

    if (loading) return <div>Loading entities...</div>;

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Entities</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all hospital entities/centers that can have protocol overrides.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/admin/entities/new"
                        className="block rounded-md bg-[#003366] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#002244]"
                    >
                        <Plus className="inline-block h-4 w-4 mr-1" />
                        Add Entity
                    </Link>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Code
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {entities.map((entity) => (
                                        <tr key={entity.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {entity.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entity.code}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <Link href={`/admin/entities/${entity.id}`} className="text-[#003366] hover:text-[#002244] mr-4">
                                                    <Pencil className="inline-block h-4 w-4" />
                                                    <span className="sr-only">Edit, {entity.name}</span>
                                                </Link>
                                                <button onClick={() => handleDelete(entity.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="inline-block h-4 w-4" />
                                                    <span className="sr-only">Delete, {entity.name}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {entities.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No entities found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
