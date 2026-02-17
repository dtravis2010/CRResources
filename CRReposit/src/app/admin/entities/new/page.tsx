import EntityForm from '@/components/admin/EntityForm';

export default function NewEntityPage() {
    return (
        <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-6">Create New Entity</h1>
            <EntityForm isEdit={false} />
        </div>
    );
}
