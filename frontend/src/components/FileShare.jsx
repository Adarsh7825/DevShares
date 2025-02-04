import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileShare() {
    const [files, setFiles] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showNearbyDialog, setShowNearbyDialog] = useState(false);
    const [downloadCode, setDownloadCode] = useState('');
    const [error, setError] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            acceptedFiles.forEach(file => formData.append('files', file));

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setFiles({
                    list: data.files,
                    code: data.code
                });
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    const handleNearbyDownload = async () => {
        if (downloadCode.length !== 4) {
            setError('Please enter a valid 4-digit code');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/download/${downloadCode}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Download zip file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create temporary link to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'shared-files.zip';
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);

            // Close dialog
            setShowNearbyDialog(false);
            setDownloadCode('');
            setError('');

        } catch (error) {
            console.error(error);
            setError('Failed to download files');
        }
    };



    return (
        <div className="min-h-screen bg-[#2D2E3B] flex flex-col">
            {/* Header */}
            <header className="bg-[#2D2E3B] border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium text-xl">ToffeeShare</span>
                        <span className="text-white/40">Making sharing sweet</span>
                    </div>
                    <button
                        onClick={() => setShowNearbyDialog(true)}
                        className="bg-[#FF6B2C] text-white px-4 py-2 rounded-lg hover:bg-[#FF7F40] transition-colors"
                    >
                        Nearby Devices
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {!files ? (
                    // Upload Area
                    <div className="w-full max-w-xl text-center">
                        <h1 className="text-white text-4xl mb-8">
                            Share files directly from your device to anywhere
                        </h1>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed border-white/20 rounded-lg p-12 cursor-pointer transition-all
                                ${isDragActive ? 'border-white/40 bg-white/5' : 'hover:border-white/30 hover:bg-white/5'}`}
                        >
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <div className="text-white/60">Uploading...</div>
                            ) : (
                                <div className="text-white/60">
                                    Click to browse or drag multiple files here to start sharing
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-center gap-8 text-white/60">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No file size limit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>End-to-end encrypted</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Share Code Display
                    <div className="bg-[#25262F] rounded-lg p-8 w-full max-w-md text-center">
                        <div className="mb-6">
                            <h2 className="text-white text-xl font-medium mb-4">Uploaded Files</h2>
                            {files.list.map((file, index) => (
                                <div key={index} className="mb-2">
                                    <p className="text-white">{file.name}</p>
                                    <p className="text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-8">
                            <div className="text-white/60 text-sm mb-4">Share this code with nearby devices:</div>
                            <div className="flex justify-center gap-2">
                                {files.code.split('').map((digit, index) => (
                                    <div
                                        key={index}
                                        className="w-12 h-12 bg-[#2D2E3B] rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                                    >
                                        {digit}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setFiles(null)}
                            className="bg-[#2D2E3B] text-white px-6 py-3 rounded-lg hover:bg-[#34354A]"
                        >
                            Share Another File
                        </button>
                    </div>
                )}
            </main>

            {/* Nearby Devices Dialog */}
            {showNearbyDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-[#25262F] rounded-lg p-8 w-full max-w-md">
                        <h2 className="text-white text-xl font-medium mb-6">Enter sharing code</h2>

                        <input
                            type="text"
                            value={downloadCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setDownloadCode(value);
                                setError('');
                            }}
                            placeholder="Enter 4-digit code"
                            className="w-full bg-[#2D2E3B] text-white placeholder-white/40 border border-white/10 rounded-lg px-4 py-3 mb-4 text-center text-2xl tracking-wider"
                            maxLength={4}
                        />

                        {error && (
                            <p className="text-red-400 text-sm mb-4">{error}</p>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleNearbyDownload}
                                className="flex-1 bg-[#FF6B2C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#FF7F40]"
                                disabled={downloadCode.length !== 4}
                            >
                                Download
                            </button>
                            <button
                                onClick={() => {
                                    setShowNearbyDialog(false);
                                    setDownloadCode('');
                                    setError('');
                                }}
                                className="flex-1 bg-[#2D2E3B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#34354A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileShare;