'use client';
import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SeederPage() {
    const [status, setStatus] = useState('Idle');

    const runSeed = async () => {
        setStatus('Running...');
        try {
            // 1. Create Admin User (Client Side) - DISABLED: Firebase Auth not configured
            // try {
            //     const userCred = await createUserWithEmailAndPassword(auth, 'admin@radiology.hub', 'password123');
            //     await updateProfile(userCred.user, { displayName: 'Admin User' });
            //     setStatus(prev => prev + '\nCreated admin user.');
            // } catch (e: any) {
            //     if (e.code === 'auth/email-already-exists') {
            //         setStatus(prev => prev + '\nAdmin user exists.');
            //     } else {
            //         throw e;
            //     }
            // }

            // 2. Seed Entity
            const thpId = 'thp';
            await setDoc(doc(db, 'entities', thpId), {
                name: 'Texas Health Plano',
                code: 'THP',
                logoUrl: 'https://placehold.co/400x400/003366/ffffff?text=THP',
                id: thpId
            });
            setStatus(prev => prev + '\nSeeded Entity.');

            // 3. Seed Exam
            const examId = 'cta-abdomen';
            await setDoc(doc(db, 'exams', examId), {
                title: 'CTA Abdomen and Pelvis',
                slug: 'cta-abdomen-pelvis',
                modality: 'CT',
                imageUrl: 'https://placehold.co/800x400/009543/ffffff?text=CTA+Abdomen+%26+Pelvis',
                enabledEntities: [thpId], // Only enabled for Texas Health Plano
                notes: [
                    {
                        id: 'contrast-note',
                        content: '**CTA Contrast Note:** A CTA is performed with and without contrast. If an order specifies "with contrast" only, it is valid — transcribe as W/WO. No revised order is needed. However, if the order specifies "without contrast," a revised order is required.',
                        type: 'success'
                    }
                ],
                cptCodes: ['74174'],
                tags: ['abdomen', 'pelvis'],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: 1,
                variants: [
                    {
                        id: 'routine',
                        name: 'Routine / Runoff',
                        sections: [
                            {
                                id: 'indication',
                                title: 'Indication',
                                content: 'Evaluation of abdominal aortic aneurysm (AAA).',
                                overrides: {}
                            },
                            {
                                id: 'technique',
                                title: 'Technique',
                                content: 'IV Contrast: 100mL Omnipaque 350 @ 4mL/sec.',
                                overrides: {
                                    [thpId]: 'IV Contrast: 125mL Isovue 370 @ 5mL/sec.\n**Note:** THP uses a dual-head injector.'
                                }
                            }
                        ]
                    }
                ]
            });
            setStatus(prev => prev + '\nSeeded Exam.');
            setStatus(prev => prev + '\nDONE.');

        } catch (err: any) {
            console.error(err);
            setStatus(prev => prev + '\nERROR: ' + err.message);
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <button onClick={runSeed} className="bg-blue-500 text-white px-4 py-2 rounded">Run Seed</button>
            <pre className="mt-4 bg-gray-100 p-4 border rounded">{status}</pre>
        </div>
    );
}
