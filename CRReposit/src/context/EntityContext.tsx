'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Entity } from '@/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EntityContextType {
    currentEntity: Entity | null;
    entities: Entity[];
    selectEntity: (entity: Entity) => void;
    loading: boolean;
}

const EntityContext = createContext<EntityContextType>({
    currentEntity: null,
    entities: [],
    selectEntity: () => { },
    loading: true
});

export const useEntity = () => useContext(EntityContext);

export const EntityProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const q = query(collection(db, 'entities'), orderBy('name'));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Entity));
                setEntities(data);

                // Load from localStorage
                const savedId = localStorage.getItem('selectedEntityId');

                if (savedId) {
                    const saved = data.find(e => e.id === savedId);
                    if (saved) {
                        setCurrentEntity(saved);
                    } else if (data.length > 0) {
                        setCurrentEntity(data[0]); // Default to first if saved is invalid
                    }
                } else if (data.length > 0) {
                    setCurrentEntity(data[0]); // Default to first
                }
            } catch (err) {
                console.error("Failed to load entities", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntities();
    }, []);

    const selectEntity = (entity: Entity) => {
        setCurrentEntity(entity);
        localStorage.setItem('selectedEntityId', entity.id);
    };

    return (
        <EntityContext.Provider value={{ currentEntity, entities, selectEntity, loading }}>
            {children}
        </EntityContext.Provider>
    );
};
