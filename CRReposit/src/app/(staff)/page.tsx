import { Suspense } from 'react';
import ExamListContent from '@/components/staff/ExamListContent';

export default function StaffHomePage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    }>
      <ExamListContent />
    </Suspense>
  );
}
