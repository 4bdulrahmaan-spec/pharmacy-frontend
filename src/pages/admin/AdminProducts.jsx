import { useState, useEffect } from 'react';
import { api, useStore } from '../../store';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Plus, Edit, Trash2 } from 'lucide-react';

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

    const { userInfo } = useStore();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [userInfo]);

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
            setFormData({ name: '', price: 0, description: '', imageUrl: 'no-photo.jpg', brand: '', category: '', stock: 0, type: 'medicine', requiresPrescription: false });
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
            requiresPrescription: product.requiresPrescription || false
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditMode(false);
        setEditProductId(null);
        setFormData({ name: '', price: 0, description: '', imageUrl: 'no-photo.jpg', brand: '', category: '', stock: 0, type: 'medicine', requiresPrescription: false });
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
                <button
                    onClick={openCreateModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Product</span>
                </button>
            </div>

            {loadingDelete && <Loader />}
            {error && <Message variant="danger">{error}</Message>}

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
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
        </div>
    );
};

export default AdminProducts;
