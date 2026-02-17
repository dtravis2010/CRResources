export type Modality = 'CT' | 'MRI' | 'US' | 'XR' | 'NM' | 'IR';

export interface Entity {
    id: string;
    name: string;
    code: string;
    logoUrl?: string;
}

export interface ExamSection {
    id: string;
    title: string;
    content: string; // HTML or Markdown
    overrides?: Record<string, string>; // entityId -> overridden content
}

export interface ExamVariant {
    id: string;
    name: string; // e.g. "With Contrast", "Without Contrast"
    sections: ExamSection[];
}

export interface ExamNote {
    id: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

export interface Exam {
    id: string;
    title: string;
    slug: string; // unique url-friendly identifier
    modality: string;
    imageUrl?: string;                    // Header image URL for exam
    enabledEntities?: string[];           // Array of entity IDs where exam is active
    notes?: ExamNote[];                   // Color-coded alert boxes
    cptCodes?: string[];
    tags?: string[];
    variants?: ExamVariant[];
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
    version: number;
}

export interface Issue {
    id: string;
    examId: string;
    entityId?: string;
    description: string;
    reporterName?: string;
    status: 'Open' | 'Resolved' | 'Ignored';
    createdAt: number;
}
