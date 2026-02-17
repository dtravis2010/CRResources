'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entity } from '@/types';

interface EntityFormProps {
    initialData?: Entity;
    isEdit?: boolean;
}

export default function EntityForm({ initialData, isEdit = false }: EntityFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Entity>>({
        name: '',
        code: '',
        logoUrl: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && initialData?.id) {
                await setDoc(doc(db, 'entities', initialData.id), formData as Entity, { merge: true });
            } else {
                await addDoc(collection(db, 'entities'), formData);
            }
            router.push('/admin/entities');
            router.refresh();
        } catch (error) {
            console.error('Error saving entity:', error);
            alert('Failed to save entity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md max-w-2xl">
            <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Entity Name
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm sm:leading-6 pl-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">
                    Entity Code (e.g. THP)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="code"
                        id="code"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm sm:leading-6 pl-2"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium leading-6 text-gray-900">
                    Logo URL (Optional)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="logoUrl"
                        id="logoUrl"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm sm:leading-6 pl-2"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-x-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-[#003366] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#002244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366]"
                >
                    {loading ? 'Saving...' : 'Save Entity'}
                </button>
            </div>
        </form>
    );
}
