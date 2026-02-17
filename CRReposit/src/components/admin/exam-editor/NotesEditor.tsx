'use client';
import { useState } from 'react';
import { ExamNote } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface NotesEditorProps {
    notes: ExamNote[];
    onChange: (notes: ExamNote[]) => void;
}

export default function NotesEditor({ notes, onChange }: NotesEditorProps) {
    const addNote = () => {
        const newNote: ExamNote = {
            id: crypto.randomUUID(),
            content: '',
            type: 'info'
        };
        onChange([...notes, newNote]);
    };

    const updateNote = (index: number, field: keyof ExamNote, value: string) => {
        const updated = notes.map((note, i) =>
            i === index ? { ...note, [field]: value } : note
        );
        onChange(updated);
    };

    const deleteNote = (index: number) => {
        onChange(notes.filter((_, i) => i !== index));
    };

    const noteTypeColors = {
        success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
        warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
        info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
        error: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Exam Notes / Alerts</h3>
                <button
                    type="button"
                    onClick={addNote}
                    className="flex items-center gap-1 text-sm text-[#003366] hover:text-[#002244]"
                >
                    <Plus className="h-4 w-4" />
                    Add Note
                </button>
            </div>

            {notes.length === 0 && (
                <p className="text-sm text-gray-400 italic">No notes added. Click "Add Note" to create color-coded alerts.</p>
            )}

            {notes.map((note, index) => {
                const colors = noteTypeColors[note.type];
                return (
                    <div key={note.id} className={`p-4 border-l-4 rounded ${colors.bg} ${colors.border}`}>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <select
                                    value={note.type}
                                    onChange={(e) => updateNote(index, 'type', e.target.value)}
                                    className={`text-xs rounded px-2 py-1 border ${colors.border} ${colors.text} font-medium`}
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="error">Error (Red)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => deleteNote(index)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <textarea
                                value={note.content}
                                onChange={(e) => updateNote(index, 'content', e.target.value)}
                                placeholder="Enter note content (Markdown supported)"
                                className={`w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-${colors.border} focus:border-transparent`}
                                rows={3}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
