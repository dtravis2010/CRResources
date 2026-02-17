'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam } from '@/types';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { useEntity } from '@/context/EntityContext';

function ExamListContent() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') || '';
    const { currentEntity } = useEntity();

    useEffect(() => {
        const fetchExams = async () => {
            const q = query(collection(db, 'exams'), orderBy('title'));
            const snap = await getDocs(q);
            const allExams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));

            // Filter by entity
            const filtered = allExams.filter(exam => {
                if (!exam.enabledEntities || exam.enabledEntities.length === 0) {
                    return true;
                }
                return currentEntity && exam.enabledEntities.includes(currentEntity.id);
            });

            setExams(filtered);
            setLoading(false);
        };
        fetchExams();
    }, [currentEntity]);

    const filteredExams = exams.filter(exam => {
        const term = searchTerm.toLowerCase();
        return (
            exam.title.toLowerCase().includes(term) ||
            exam.modality.toLowerCase().includes(term) ||
            exam.tags?.some(tag => tag.toLowerCase().includes(term)) ||
            exam.cptCodes?.some(code => code.includes(term))
        );
    });

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#003366]">
                {searchTerm ? `Search Results for "${searchTerm}"` : 'All Protocols'}
            </h1>

            {filteredExams.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No protocols found matching your criteria.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredExams.map(exam => (
                        <Link key={exam.id} href={`/exams/${exam.id}`} className="block group">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#003366] transition-all h-full flex flex-col overflow-hidden">
                                {/* Exam Image Thumbnail */}
                                {exam.imageUrl ? (
                                    <div className="h-48 overflow-hidden bg-gradient-to-br from-[#009543] to-[#00b050]">
                                        <img
                                            src={exam.imageUrl}
                                            alt={exam.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center">
                                        <FileText className="h-16 w-16 text-white/50" />
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#003366] line-clamp-2">
                                                {exam.title}
                                            </h3>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {exam.modality}
                                                </span>
                                                {exam.cptCodes?.slice(0, 2).map(code => (
                                                    <span key={code} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                        CPT: {code}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center text-sm text-[#003366] font-medium">
                                        View Protocol <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ExamListContent;
