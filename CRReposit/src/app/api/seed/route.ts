import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // 1. Create Admin User
        const email = 'admin@radiology.hub';
        const password = 'password123';

        try {
            await adminAuth.createUser({
                email,
                password,
                displayName: 'Admin User',
            });
            console.log('Created admin user');
        } catch (e: any) {
            if (e.code === 'auth/email-already-exists') {
                console.log('Admin user already exists');
            } else {
                throw e;
            }
        }

        // 2. Seed Entity: Texas Health Plano
        const thpId = 'thp';
        await adminDb.collection('entities').doc(thpId).set({
            name: 'Texas Health Plano',
            code: 'THP',
            logoUrl: 'https://placehold.co/400x400/003366/ffffff?text=THP', // Placeholder
            id: thpId
        });

        // 3. Seed Exam: CTA Abdomen
        const examId = 'cta-abdomen';
        const variantId = 'routine';
        const section1Id = 'indication';
        const section2Id = 'technique';

        await adminDb.collection('exams').doc(examId).set({
            title: 'CTA Abdomen and Pelvis',
            slug: 'cta-abdomen-pelvis',
            modality: 'CT',
            cptCodes: ['74174'],
            tags: ['abdomen', 'pelvis', 'angiogram'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
            variants: [
                {
                    id: variantId,
                    name: 'Routine / Runoff',
                    sections: [
                        {
                            id: section1Id,
                            title: 'Indication',
                            content: 'Evaluation of abdominal aortic aneurysm (AAA), dissection, or mesenteric ischemia.',
                            overrides: {}
                        },
                        {
                            id: section2Id,
                            title: 'Technique',
                            content: 'IV Contrast: 100mL Omnipaque 350 @ 4mL/sec.\nScan Delay: Bolus Tracking on descending aorta.',
                            overrides: {
                                [thpId]: 'IV Contrast: 125mL Isovue 370 @ 5mL/sec.\n**Note:** THP uses a dual-head injector for saline flush.'
                            }
                        }
                    ]
                }
            ]
        });

        return NextResponse.json({ success: true, message: 'Seeding complete. Login with admin@radiology.hub / password123' });
    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
