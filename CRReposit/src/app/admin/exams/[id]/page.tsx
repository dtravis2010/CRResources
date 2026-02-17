'use client';
import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Exam } from '@/types';
import ExamEditor from '@/components/admin/exam-editor/ExamEditor';

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const docRef = doc(db, 'exams', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setExam({ id: docSnap.id, ...docSnap.data() } as Exam);
                }
            } catch (error) {
                console.error("Error fetching exam", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!exam) return <div>Exam not found</div>;

    return <ExamEditor isEdit={true} initialData={exam} />;
}
