'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam, ExamVariant, Entity } from '@/types';
import VariantEditor from './VariantEditor';
import NotesEditor from './NotesEditor';
import ImageUpload from './ImageUpload';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ExamEditorProps {
    initialData?: Exam;
    isEdit?: boolean;
}

const MODALITIES = ['CT', 'MRI', 'US', 'XR', 'NM', 'IR'];

export default function ExamEditor({ initialData, isEdit }: ExamEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [entities, setEntities] = useState<Entity[]>([]);

    const [formData, setFormData] = useState<Partial<Exam>>({
        title: '',
        modality: 'CT',
        imageUrl: '',
        enabledEntities: [],
        notes: [],
        cptCodes: [],
        tags: [],
        variants: [],
    });

    // Local state for comma-separated inputs
    const [cptInput, setCptInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        // Fetch Entities for Overrides
        const fetchEntities = async () => {
            const q = query(collection(db, 'entities'), orderBy('name'));
            const snap = await getDocs(q);
            setEntities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Entity)));
        };
        fetchEntities();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setCptInput(initialData.cptCodes?.join(', ') || '');
            setTagsInput(initialData.tags?.join(', ') || '');
        } else if (!isEdit) {
            // Default variant for new exam
            setFormData(prev => ({
                ...prev,
                variants: [{
                    id: crypto.randomUUID(),
                    name: 'Default Protocol',
                    sections: []
                }]
            }));
        }
    }, [initialData, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const examData: Partial<Exam> = {
            ...formData,
            cptCodes: cptInput.split(',').map(s => s.trim()).filter(Boolean),
            tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
            updatedAt: Date.now(),
        };

        try {
            if (isEdit && initialData?.id) {
                await setDoc(doc(db, 'exams', initialData.id), examData, { merge: true });
            } else {
                const newDoc = {
                    ...examData,
                    createdAt: Date.now(),
                    version: 1
                };
                await addDoc(collection(db, 'exams'), newDoc);
            }
            router.push('/admin/exams');
            router.refresh();
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Failed to save exam');
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (index: number, updatedVariant: ExamVariant) => {
        const newVariants = [...(formData.variants || [])];
        newVariants[index] = updatedVariant;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantDelete = (index: number) => {
        if (confirm('Delete this variant?')) {
            const newVariants = (formData.variants || []).filter((_, i) => i !== index);
            setFormData({ ...formData, variants: newVariants });
        }
    };

    const handleAddVariant = () => {
        const newVariant: ExamVariant = {
            id: crypto.randomUUID(),
            name: 'New Variant',
            sections: []
        };
        setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
    };

    return (
        <div className="pb-20">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                    {isEdit ? `Edit Exam: ${initialData?.title}` : 'Create New Exam'}
                </h1>
                <div className="flex gap-2">
                    <Link href="/admin/exams" className="btn-secondary flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#003366] text-sm font-medium text-white shadow-sm hover:bg-[#002244]"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Protocol'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Metadata Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 shadow rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Metadata</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#003366] focus:ring-[#003366] sm:text-sm border p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Modality</label>
                                <select
                                    value={formData.modality}
                                    onChange={(e) => setFormData({ ...formData, modality: e.target.value as any })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#003366] focus:ring-[#003366] sm:text-sm border p-2"
                                >
                                    {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">CPT Codes</label>
                                <input
                                    type="text"
                                    placeholder="001, 002"
                                    value={cptInput}
                                    onChange={(e) => setCptInput(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#003366] focus:ring-[#003366] sm:text-sm border p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags</label>
                                <input
                                    type="text"
                                    placeholder="abdomen, cta"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#003366] focus:ring-[#003366] sm:text-sm border p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white p-4 shadow rounded-lg border border-gray-200">
                        <ImageUpload
                            value={formData.imageUrl || ''}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            label="Exam Header Image"
                        />
                    </div>

                    {/* Entity Activation */}
                    <div className="bg-white p-4 shadow rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Enable for Entities</h3>
                        <p className="text-xs text-gray-500 mb-3">Select which entities can perform this exam. Leave unchecked to enable for all.</p>
                        <div className="space-y-2">
                            {entities.map(entity => (
                                <label key={entity.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.enabledEntities?.includes(entity.id) || false}
                                        onChange={(e) => {
                                            const current = formData.enabledEntities || [];
                                            const updated = e.target.checked
                                                ? [...current, entity.id]
                                                : current.filter(id => id !== entity.id);
                                            setFormData({ ...formData, enabledEntities: updated });
                                        }}
                                        className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                                    />
                                    <span className="text-sm text-gray-700">{entity.name}</span>
                                </label>
                            ))}
                            {entities.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No entities found. Create entities first.</p>
                            )}
                        </div>
                    </div>

                    {/* Exam Notes/Alerts */}
                    <div className="bg-white p-4 shadow rounded-lg border border-gray-200">
                        <NotesEditor
                            notes={formData.notes || []}
                            onChange={(notes) => setFormData({ ...formData, notes })}
                        />
                    </div>
                </div>

                {/* Variants Editor */}
                <div className="lg:col-span-3">
                    <div className="space-y-6">
                        {formData.variants?.map((variant, index) => (
                            <VariantEditor
                                key={variant.id}
                                variant={variant}
                                entities={entities}
                                onChange={(updated) => handleVariantChange(index, updated)}
                                onDelete={() => handleVariantDelete(index)}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#003366] hover:text-[#003366] flex justify-center items-center gap-2 font-medium"
                        >
                            <Plus className="h-5 w-5" /> Add Protocol Variant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
