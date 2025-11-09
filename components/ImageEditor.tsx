
import React, { useState, useCallback, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { SparklesIcon, UploadIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

// Helper to convert file to base64
const toBase64 = (file: File): Promise<{ data: string, mimeType: string, objectUrl: string }> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    const objectUrl = URL.createObjectURL(file);
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const data = result.split(',')[1];
        resolve({ data, mimeType, objectUrl });
    };
    reader.onerror = reject;
});

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError('');
            setEditedImage(null);
            try {
                const { data, mimeType, objectUrl } = await toBase64(file);
                setOriginalImage({ data, mimeType, url: objectUrl });
            } catch (e) {
                console.error(e);
                setError('Could not read the selected file. Please try another image.');
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalImage || !prompt || isLoading) return;

        setIsLoading(true);
        setError('');
        setEditedImage(null);

        try {
            const result = await editImage(originalImage.data, originalImage.mimeType, prompt);
            setEditedImage(result);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'An unexpected error occurred while editing the image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setPrompt('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-stone-200 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-serif text-stone-800">AI Image Editor</h2>
                <p className="text-stone-600 mt-1">Upload an image and tell the AI what changes to make.</p>
            </div>

            {!originalImage ? (
                <>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-stone-50 hover:border-red-700 transition"
                    >
                        <UploadIcon className="w-12 h-12 text-stone-400 mb-3" />
                        <span className="font-semibold text-red-800">Click to upload</span>
                        <span className="text-stone-500 text-sm mt-1">PNG, JPG, or WEBP</span>
                    </label>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                     {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                             <h3 className="font-semibold text-stone-700">Original Image</h3>
                             <button type="button" onClick={handleRemoveImage} className="text-sm text-red-700 hover:text-red-800 font-semibold">Change</button>
                           </div>
                            <img src={originalImage.url} alt="Original upload" className="w-full h-auto object-contain rounded-lg border border-stone-300 bg-stone-50" />
                        </div>
                         <div className="relative space-y-2">
                            <h3 className="font-semibold text-stone-700">Edited Image</h3>
                            <div className="w-full aspect-square bg-stone-100 rounded-lg border border-stone-300 flex items-center justify-center overflow-hidden">
                               {isLoading && (
                                    <div className="flex flex-col items-center">
                                        <LoadingSpinner />
                                        <p className="mt-2 text-red-800">Editing your image...</p>
                                    </div>
                                )}
                                {editedImage && !isLoading && (
                                     <img src={editedImage} alt="Edited result" className="w-full h-auto object-contain" />
                                )}
                                {!editedImage && !isLoading && (
                                    <p className="text-stone-500">Your edited image will appear here</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="prompt" className="block text-md font-semibold text-stone-700 mb-2">
                            What would you like to change?
                        </label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter', 'Make the sky purple', 'Remove the person in the background'"
                            rows={3}
                            className="w-full px-4 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 transition duration-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !prompt}
                        className="w-full flex items-center justify-center bg-red-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 transition-all transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            'Generating...'
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Edit Image
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ImageEditor;