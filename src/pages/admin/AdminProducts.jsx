import { useState, useEffect } from 'react';
import { api, useStore } from '../../store';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Plus, Edit, Trash2, ScanLine, BrainCircuit, Camera } from 'lucide-react';
import BarcodeScanner from '../../components/BarcodeScanner';
import AICameraScanner from '../../components/AICameraScanner';
import { parseGS1IndianQR } from '../../utils/qrParser';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '', price: 0, description: '', imageUrl: 'no-photo.jpg',
        brand: '', category: '', stock: 0, type: 'medicine', requiresPrescription: false
    });
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanningBox, setScanningBox] = useState(false);
    const [showAICamera, setShowAICamera] = useState(false);

    const { userInfo } = useStore();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [userInfo]);


    const processAIImage = async (file) => {
        if (!file) return false;

        setScanningBox(true);
        const submitData = new FormData();
        submitData.append('image', file);

        try {
            const { data } = await api.post('/scan', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                brand: data.brand || prev.brand
            }));

            if (!data.name && !data.brand) {
                alert("AI could not confidently find a Name or Brand on that box.");
            }
            return true;
        } catch (error) {
            console.error("AI Scan Error:", error);
            alert(error.response?.data?.message || "Failed to scan box using AI.");
            return false;
        } finally {
            setScanningBox(false);
        }
    };

    const scanBoxHandler = async (e) => {
        await processAIImage(e.target.files[0]);
        e.target.value = '';
    };

    const handleCameraCapture = async (file) => {
        const success = await processAIImage(file);
        if (success) {
            setShowAICamera(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoadingCreate(true);
            if (editMode) {
                await api.put(`/products/${editProductId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setLoadingCreate(false);
            setShowModal(false);
            setFormData({ name: '', price: 0, description: '', imageUrl: 'no-photo.jpg', brand: '', category: '', stock: 0, type: 'medicine', requiresPrescription: false, barcode: '' });
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingCreate(false);
        }
    };

    const openEditModal = (product) => {
        setEditMode(true);
        setEditProductId(product._id);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            brand: product.brand,
            category: product.category?._id || product.category || '',
            stock: product.stock,
            type: product.type || 'medicine',
            requiresPrescription: product.requiresPrescription || false,
            barcode: product.barcode || ''
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditMode(false);
        setEditProductId(null);
        setFormData({ name: '', price: 0, description: '', imageUrl: 'no-photo.jpg', brand: '', category: '', stock: 0, type: 'medicine', requiresPrescription: false, barcode: '' });
        setShowModal(true);
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('image', file);
        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        } catch (err) {
            alert('Image upload failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const uploadCsvHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setUploadingCsv(true);
            const { data } = await api.post('/upload/csv', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert(data.message);
            fetchProducts(); // Refresh the list with the newly imported products
        } catch (err) {
            alert('CSV import failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingCsv(false);
            // Reset file input so the same file can be selected again
            e.target.value = '';
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setLoadingDelete(true);
                await api.delete(`/products/${id}`);
                setLoadingDelete(false);
                fetchProducts(); // Refresh list
            } catch (err) {
                alert(err.response?.data?.message || err.message);
                setLoadingDelete(false);
            }
        }
    };

    if (!userInfo || userInfo.role !== 'admin') {
        return <Message variant="danger">Not authorized as admin</Message>;
    }

    return (
        <div className="px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <label className={`btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none
                        ${uploadingCsv ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{uploadingCsv ? 'Uploading...' : 'Import CSV'}</span>
                        <input type="file" accept=".csv" className="hidden" onChange={uploadCsvHandler} disabled={uploadingCsv} />
                    </label>

                    <button
                        onClick={openCreateModal}
                        className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none py-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Product</span>
                    </button>
                </div>
            </div>

            {loadingDelete && <Loader />}
            {error && <Message variant="danger">{error}</Message>}

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[500px]">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">ID</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">Name</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">Price</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">Category</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">Stock</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700 flex justify-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 border-b dark:border-gray-700 last:border-0 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {product._id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            ₹{product.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.category?.name || product.category || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock > 0 ? (
                                                <span className="text-green-600 font-medium">{product.stock} in stock</span>
                                            ) : (
                                                <span className="text-red-500 font-medium">Out of stock</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-3">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{editMode ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                        <form onSubmit={submitHandler} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                    <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                                    <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                                    <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field bg-white dark:bg-gray-800">
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field bg-white dark:bg-gray-800">
                                        <option value="medicine">Medicine</option>
                                        <option value="pet">Pet Product</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode (Optional)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Scan or enter barcode"
                                            value={formData.barcode || ''}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                            className="input-field flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowScanner(true)}
                                            className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 border-0 flex items-center justify-center px-4"
                                            title="Scan Barcode with Camera"
                                        >
                                            <ScanLine className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-2 text-right flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAICamera(true)}
                                            disabled={scanningBox}
                                            className="btn bg-purple-100 hover:bg-purple-200 text-purple-800 border-0 inline-flex items-center justify-center px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors disabled:opacity-50"
                                            title="Use AI Camera to read the box"
                                        >
                                            <Camera className="w-4 h-4 mr-2" />
                                            AI Camera Scan
                                        </button>
                                        <label className="btn bg-purple-100 hover:bg-purple-200 text-purple-800 border-0 inline-flex items-center justify-center px-4 py-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors disabled:opacity-50" title="Upload image to read the box">
                                            <BrainCircuit className="w-4 h-4 mr-2" />
                                            {scanningBox ? 'Scanning via AI...' : 'AI Image Upload'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={scanBoxHandler}
                                                accept="image/*"
                                                disabled={scanningBox}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Image</label>
                                    <input type="file" required={!editMode} onChange={uploadFileHandler} accept="image/*" className="input-field w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-gray-200" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field"></textarea>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="presc" checked={formData.requiresPrescription} onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <label htmlFor="presc" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Requires Prescription</label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                                <button type="submit" disabled={loadingCreate} className="btn-primary">
                                    {loadingCreate ? 'Saving...' : (editMode ? 'Update Medicine' : 'Add Medicine')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAICamera && (
                <AICameraScanner
                    onCapture={handleCameraCapture}
                    onClose={() => setShowAICamera(false)}
                    isScanning={scanningBox}
                />
            )}

            {showScanner && (
                <BarcodeScanner
                    onScanSuccess={(code) => {
                        setShowScanner(false);

                        // Check if it's likely a GS1 Indian Medicine QR code (starts with 01 and is long)
                        let rawCode = code.replace(/[\(\)]/g, "");
                        if (rawCode.startsWith("01") && rawCode.length > 25) {
                            const parsedData = parseGS1IndianQR(code);

                            setFormData(prev => ({
                                ...prev,
                                barcode: code,
                                name: parsedData.name || prev.name
                            }));

                            if (parsedData.name) {
                                alert(`Successfully extracted Indian QR Details:\nName: ${parsedData.name}`);
                            } else {
                                alert("Scanned GS1 QR Code, but could not securely locate the Product Name block. Raw data saved.");
                            }
                        } else {
                            // It's a regular barcode
                            setFormData(prev => ({ ...prev, barcode: code }));
                            alert("Barcode Scanned! Use the AI Box Scan to extract the Name and Brand directly from the box.");
                        }
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default AdminProducts;
