'use client';
import { Section, Entity, ExamVariant } from '@/types';
import SectionEditor from './SectionEditor';
import { useState } from 'react';
import { Trash2, Plus, Layers } from 'lucide-react';

interface VariantEditorProps {
    variant: ExamVariant;
    entities: Entity[];
    onChange: (updated: ExamVariant) => void;
    onDelete: () => void;
}

export default function VariantEditor({ variant, entities, onChange, onDelete }: VariantEditorProps) {
    const handleAddSection = () => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            title: 'New Section',
            content: '',
            overrides: {}
        };
        onChange({
            ...variant,
            sections: [...variant.sections, newSection]
        });
    };

    const handleSectionChange = (index: number, updatedSection: Section) => {
        const newSections = [...variant.sections];
        newSections[index] = updatedSection;
        onChange({ ...variant, sections: newSections });
    };

    const handleSectionDelete = (index: number) => {
        const newSections = variant.sections.filter((_, i) => i !== index);
        onChange({ ...variant, sections: newSections });
    };

    return (
        <div className="bg-white shadow rounded-lg mb-6 border border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-2 w-full max-w-md">
                    <Layers className="h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm sm:leading-6 pl-2 font-semibold"
                        value={variant.name}
                        onChange={(e) => onChange({ ...variant, name: e.target.value })}
                        placeholder="Variant Name (e.g. Without Contrast)"
                    />
                </div>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                    <Trash2 className="h-4 w-4" /> Remove Variant
                </button>
            </div>

            <div className="p-4 bg-gray-100 min-h-[100px]">
                {variant.sections.map((section, index) => (
                    <SectionEditor
                        key={section.id}
                        section={section}
                        entities={entities}
                        onChange={(updated) => handleSectionChange(index, updated)}
                        onDelete={() => handleSectionDelete(index)}
                    />
                ))}

                <button
                    type="button"
                    onClick={handleAddSection}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-[#003366] hover:text-[#003366] transition-colors flex justify-center items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add Section
                </button>
            </div>
        </div>
    );
}
