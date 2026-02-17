export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to the Radiology Resource Hub Admin.</p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder Stats Cards */}
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Exams</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">--</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Active Entities</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">--</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Open Issues</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">--</dd>
                </div>
            </div>
        </div>
    );
}
