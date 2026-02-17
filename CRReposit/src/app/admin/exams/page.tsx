'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // In a real app with many exams, do server-side filtering or algolia.
        // For now, client-side filtering on a reasonable dataset.
        const q = query(collection(db, 'exams'), orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Exam[];
            setExams(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this exam?')) {
            await deleteDoc(doc(db, 'exams', id));
        }
    };

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.modality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading exams...</div>;

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Exams / Protocols</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage radiology protocols, variants, and entity-specific instructions.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/admin/exams/new"
                        className="block rounded-md bg-[#003366] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#002244]"
                    >
                        <Plus className="inline-block h-4 w-4 mr-1" />
                        Create Protocol
                    </Link>
                </div>
            </div>

            <div className="mt-6 flex items-center bg-white p-2 rounded-md shadow-sm ring-1 ring-gray-300">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search protocols..."
                    className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Title
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Modality
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Last Updated
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredExams.map((exam) => (
                                        <tr key={exam.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {exam.title}
                                                <div className="text-gray-500 font-normal text-xs">{exam.variants?.length || 0} variants</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {exam.modality}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(exam.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <Link href={`/admin/exams/${exam.id}`} className="text-[#003366] hover:text-[#002244] mr-4">
                                                    <Pencil className="inline-block h-4 w-4" />
                                                    <span className="sr-only">Edit, {exam.title}</span>
                                                </Link>
                                                <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="inline-block h-4 w-4" />
                                                    <span className="sr-only">Delete, {exam.title}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExams.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No exams found.
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
