'use client';
import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Upload, X, Check, Loader } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "Exam Image" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            // Create a unique filename
            const timestamp = Date.now();
            const fileName = `exams/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storageRef = ref(storage, fileName);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Track progress
                    const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(Math.round(prog));
                },
                (error) => {
                    // Handle error
                    console.error('Upload error:', error);
                    setError('Failed to upload image. Please try again.');
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onChange(downloadURL);
                    setUploading(false);
                    setProgress(100);
                }
            );
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange('');
        setProgress(0);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {/* Preview or Upload Button */}
            {value ? (
                <div className="relative rounded-lg border-2 border-gray-200 overflow-hidden">
                    <img
                        src={value}
                        alt="Exam preview"
                        className="w-full h-48 object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Remove image"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Uploaded
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload-input"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="image-upload-input"
                        className={`
                            flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
                            ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                            transition-colors
                        `}
                    >
                        {uploading ? (
                            <div className="text-center">
                                <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Uploading... {progress}%</p>
                                <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                            </div>
                        )}
                    </label>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {error}
                </p>
            )}

            {/* Manual URL Input (Alternative Option) */}
            <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                    Or paste image URL
                </label>
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#003366] focus:ring-[#003366] sm:text-sm border p-2"
                    disabled={uploading}
                />
            </div>
        </div>
    );
}
