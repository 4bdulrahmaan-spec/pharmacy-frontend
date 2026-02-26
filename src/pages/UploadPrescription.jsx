import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../store';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { FileUp, Info } from 'lucide-react';

const UploadPrescription = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadHandler = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            setError('');
            await api.post('/prescriptions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setLoading(false);
            setFile(null);

            // Auto redirect after 3s
            setTimeout(() => {
                navigate('/profile');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 mb-8 flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-blue-600 dark:text-blue-300 flex-shrink-0 mt-1">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How it works</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Upload a clear photo or PDF of your valid prescription.</li>
                        <li>Our pharmacists will review and verify your prescription.</li>
                        <li>Once approved, we will automatically create an order for the prescribed medicines.</li>
                        <li>You will be notified to review the order and complete the payment.</li>
                    </ol>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload Prescription</h1>

                {error && <Message variant="danger">{error}</Message>}
                {success && <Message variant="success">Prescription uploaded successfully! We will notify you once it is reviewed. Redirecting...</Message>}

                <form onSubmit={uploadHandler} className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Drag and drop your prescription here, or click to browse.
                        </p>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                dark:file:bg-gray-700 dark:file:text-gray-200"
                        />
                        {file && (
                            <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: JPG, PNG, PDF. Max size: 5MB.
                    </p>

                    <button
                        type="submit"
                        disabled={!file || loading || success}
                        className="w-full btn-primary py-3 text-lg flex justify-center items-center gap-2"
                    >
                        {loading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>}
                        Submit Prescription
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPrescription;
