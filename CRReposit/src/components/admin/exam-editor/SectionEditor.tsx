'use client';
import { Section, Entity } from '@/types';
import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

interface SectionEditorProps {
    section: Section;
    entities: Entity[];
    onChange: (updated: Section) => void;
    onDelete: () => void;
}

export default function SectionEditor({ section, entities, onChange, onDelete }: SectionEditorProps) {
    const [expanded, setExpanded] = useState(true);

    const handleOverrideAdd = (entityId: string) => {
        if (!section.overrides) section.overrides = {};
        if (section.overrides[entityId] !== undefined) return; // Already exists

        onChange({
            ...section,
            overrides: {
                ...section.overrides,
                [entityId]: '',
            },
        });
    };

    const handleOverrideChange = (entityId: string, value: string) => {
        onChange({
            ...section,
            overrides: {
                ...section.overrides,
                [entityId]: value,
            },
        });
    };

    const handleOverrideDelete = (entityId: string) => {
        const newOverrides = { ...section.overrides };
        delete newOverrides[entityId];
        onChange({
            ...section,
            overrides: newOverrides,
        });
    };

    // Filter entities that don't have overrides yet
    const availableEntities = entities.filter(e => !section.overrides || section.overrides[e.id] === undefined);

    return (
        <div className="border border-gray-200 rounded-md mb-4 bg-white shadow-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-2 font-medium text-gray-700">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Section: {section.title || 'Untitled'}
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {expanded && (
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Section Title</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={section.title}
                            onChange={(e) => onChange({ ...section, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Default Content (Markdown)</label>
                        <textarea
                            rows={5}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono"
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value })}
                        />
                    </div>

                    {/* Overrides */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-700">Entity Overrides</h4>
                            <div className="relative group">
                                {/* Simple dropdown for adding override */}
                                <select
                                    className="text-xs border rounded p-1"
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value) handleOverrideAdd(e.target.value);
                                    }}
                                >
                                    <option value="">+ Add Override</option>
                                    {availableEntities.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {section.overrides && Object.entries(section.overrides).map(([entityId, content]) => {
                            const entity = entities.find(e => e.id === entityId);
                            return (
                                <div key={entityId} className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-yellow-800">For: {entity?.name || 'Unknown Entity'}</span>
                                        <button type="button" onClick={() => handleOverrideDelete(entityId)} className="text-red-400 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <textarea
                                        rows={3}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-xs border p-2"
                                        value={content}
                                        onChange={(e) => handleOverrideChange(entityId, e.target.value)}
                                        placeholder={`Specific instructions for ${entity?.name}...`}
                                    />
                                </div>
                            );
                        })}
                        {(!section.overrides || Object.keys(section.overrides).length === 0) && (
                            <p className="text-xs text-gray-400 italic">No overrides. Showing default content for all entities.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
