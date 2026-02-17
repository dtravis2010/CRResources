'use client';
import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam } from '@/types';
import { useEntity } from '@/context/EntityContext';
import { Building2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

// Simple text renderer if markdown package not installed yet
const TextRenderer = ({ content }: { content: string }) => (
    <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
        {content}
    </div>
);

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { currentEntity } = useEntity();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    useEffect(() => {
        const fetchExam = async () => {
            const docRef = doc(db, 'exams', id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setExam({ id: snap.id, ...snap.data() } as Exam);
            }
            setLoading(false);
        };
        fetchExam();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!exam) return <div>Protocol not found.</div>;

    const activeVariant = exam.variants?.[activeVariantIndex];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#009543] to-[#00b050] text-white text-center py-8 rounded-lg mb-6 shadow-lg">
                <h1 className="text-5xl font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>{exam.title}</h1>
            </div>

            {/* Exam Image */}
            {exam.imageUrl && (
                <div className="text-center my-6">
                    <img 
                        src={exam.imageUrl} 
                        alt={exam.title}
                        className="mx-auto w-[400px] h-auto rounded-lg shadow-lg object-contain"
                    />
                </div>
            )}

            {/* Metadata and Current Entity */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {exam.modality}
                        </span>
                        {exam.tags?.map(tag => (
                            <span key={tag} className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                {tag}
                            </span>
                        ))}
                        {exam.cptCodes?.map(code => (
                            <span key={code} className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                CPT: {code}
                            </span>
                        ))}
                    </div>
                    {currentEntity && (
                        <div className="flex items-center gap-2 bg-[#7AB800]/10 text-[#7AB800] px-3 py-1 rounded-full text-xs font-bold border border-[#7AB800]/20">
                            <Building2 className="h-3 w-3" />
                            Viewing for: {currentEntity.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Color-coded Notes */}
            {exam.notes && exam.notes.length > 0 && (
                <div className="space-y-4 mb-6">
                    {exam.notes.map(note => (
                        <div 
                            key={note.id}
                            className={clsx(
                                "p-4 border-l-4 rounded",
                                note.type === 'success' && "bg-green-50 border-green-500",
                                note.type === 'warning' && "bg-yellow-50 border-yellow-500",
                                note.type === 'info' && "bg-blue-50 border-blue-500",
                                note.type === 'error' && "bg-red-50 border-red-500"
                            )}
                        >
                            <p className="text-sm font-medium whitespace-pre-wrap">{note.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Variants Tabs */}
            {exam.variants && exam.variants.length > 1 && (
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {exam.variants.map((variant, idx) => (
                            <button
                                key={variant.id}
                                onClick={() => setActiveVariantIndex(idx)}
                                className={clsx(
                                    idx === activeVariantIndex
                                        ? 'border-[#003366] text-[#003366]'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                                )}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Content */}
            <div className="space-y-6">
                {activeVariant?.sections?.map(section => {
                    // Check for override
                    const overrideContent = currentEntity && section.overrides?.[currentEntity.id];
                    const contentToShow = overrideContent || section.content;
                    const isOverridden = !!overrideContent;

                    return (
                        <div key={section.id} className={clsx("bg-white shadow rounded-lg overflow-hidden border", isOverridden ? "border-[#7AB800] ring-1 ring-[#7AB800]/50" : "border-gray-200")}>
                            <div className={clsx("px-6 py-4 border-b flex justify-between items-center", isOverridden ? "bg-[#7AB800]/5" : "bg-gray-50")}>
                                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                                {isOverridden && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-[#7AB800] bg-white px-2 py-1 rounded border border-[#7AB800]/20">
                                        <Building2 className="h-3 w-3" />
                                        {currentEntity?.name} Specific
                                    </span>
                                )}
                            </div>
                            <div className="px-6 py-6 bg-white">
                                <TextRenderer content={contentToShow} />
                                {isOverridden && (
                                    <div className="mt-4 pt-4 border-t border-dashed text-gray-400 text-xs flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Original default content was replaced for this location.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
