'use client';
import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entity } from '@/types';
import EntityForm from '@/components/admin/EntityForm';

export default function EditEntityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const docRef = doc(db, 'entities', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEntity({ id: docSnap.id, ...docSnap.data() } as Entity);
                }
            } catch (error) {
                console.error("Error fetching entity", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntity();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!entity) return <div>Entity not found</div>;

    return (
        <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-6">Edit Entity</h1>
            <EntityForm isEdit={true} initialData={entity} />
        </div>
    );
}
