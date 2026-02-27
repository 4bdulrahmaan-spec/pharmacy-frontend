import { useState, useEffect } from 'react';
import { api, useStore } from '../../store';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Product Selection State
    const [availableProducts, setAvailableProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { userInfo } = useStore();

    useEffect(() => {
        fetchPrescriptions();
        fetchProducts();
    }, [userInfo]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setAvailableProducts(data.products || data);
        } catch (err) {
            console.error("Failed to load products for prescription mapping", err);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/prescriptions');
            setPrescriptions(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        try {
            if (status === 'Approved' && selectedProducts.length === 0 && !window.confirm('Approve without attaching any medicines?')) {
                return;
            }

            setActionLoading(true);
            const payload = { status, adminNotes };

            if (status === 'Approved') {
                payload.products = selectedProducts.map(p => ({
                    product: p._id,
                    qty: p.qty
                }));
            }

            await api.put(`/prescriptions/${selectedPrescription._id}`, payload);
            fetchPrescriptions();
            setSelectedPrescription(null); // Close modal
            setAdminNotes('');
            setSelectedProducts([]);
            setActionLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setActionLoading(false);
        }
    };

    const openModal = (rx) => {
        setSelectedPrescription(rx);
        setAdminNotes(rx.adminNotes || '');
        if (rx.products && rx.products.length > 0) {
            setSelectedProducts(rx.products.map(p => ({
                ...p.product,
                qty: p.qty
            })));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleAddProduct = (product) => {
        if (!selectedProducts.find(p => p._id === product._id)) {
            setSelectedProducts([...selectedProducts, { ...product, qty: 1 }]);
        }
        setSearchTerm('');
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    };

    const handleUpdateQty = (productId, qty) => {
        if (qty < 1) return;
        setSelectedProducts(selectedProducts.map(p =>
            p._id === productId ? { ...p, qty } : p
        ));
    };

    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedProducts.find(sp => sp._id === p._id)
    ).slice(0, 5); // Limit suggestions

    if (!userInfo || userInfo.role !== 'admin') {
        return <Message variant="danger">Not authorized as admin</Message>;
    }

    return (
        <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prescription Verifications</h1>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 min-w-[600px]">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">ID</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">USER</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">DATE UPLOADED</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">STATUS</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700 flex justify-end">REVIEW</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((rx) => (
                                    <tr key={rx._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 border-b dark:border-gray-700 last:border-0 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {rx._id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                            {rx.user?.name || 'Deleted User'} ({rx.user?.email})
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(rx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${rx.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                rx.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {rx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => openModal(rx)}
                                                    className="text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 p-2 rounded-md transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Prescription Review Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto pt-24">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full p-6 relative flex flex-col max-h-[90vh]">

                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Prescription</h2>
                            <button
                                onClick={() => setSelectedPrescription(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-2">
                            {/* Left Side: Document Preview */}
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-2 flex items-center justify-center min-h-[400px]">
                                {selectedPrescription.imageUrl.includes('.pdf') ? (
                                    <iframe
                                        src={selectedPrescription.imageUrl}
                                        className="w-full h-full min-h-[500px] rounded-lg border-0"
                                        title="Prescription PDF"
                                    />
                                ) : (
                                    <img
                                        src={selectedPrescription.imageUrl}
                                        alt="Prescription"
                                        className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                                    />
                                )}
                            </div>

                            {/* Right Side: Verification Controls */}
                            <div className="flex flex-col space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">User Details</h3>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedPrescription.user?.name}</p>
                                    <p className="text-gray-600 dark:text-gray-300">{selectedPrescription.user?.email}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Uploaded: {new Date(selectedPrescription.createdAt).toLocaleString()}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Status</h3>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold inline-block ${selectedPrescription.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        selectedPrescription.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedPrescription.status}
                                    </span>
                                </div>

                                {/* Product Attachment Section for Pending Status */}
                                {selectedPrescription.status === 'Pending' && (
                                    <div className="border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wider mb-3">
                                            Attach Prescribed Medicines
                                        </h3>

                                        <div className="relative mb-4">
                                            <input
                                                type="text"
                                                placeholder="Search medicines..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full rounded-lg border border-primary-300 dark:border-primary-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                            {searchTerm && filteredProducts.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                                    {filteredProducts.map(product => (
                                                        <div
                                                            key={product._id}
                                                            onClick={() => handleAddProduct(product)}
                                                            className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
                                                        >
                                                            <span>{product.name}</span>
                                                            <span className="text-gray-500">₹{product.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {selectedProducts.length > 0 && (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {selectedProducts.map(product => (
                                                    <div key={product._id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="truncate flex-1 pr-2">{product.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={product.qty}
                                                                onChange={(e) => handleUpdateQty(product._id, parseInt(e.target.value))}
                                                                className="w-12 px-1 py-0.5 border rounded text-center dark:bg-gray-700"
                                                            />
                                                            <button onClick={() => handleRemoveProduct(product._id)} className="text-red-500 hover:text-red-700">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Display Attached Products if already approved */}
                                {selectedPrescription.status === 'Approved' && selectedProducts.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Prescribed Items</h3>
                                        <ul className="space-y-1 text-sm bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            {selectedProducts.map(p => (
                                                <li key={p._id} className="flex justify-between">
                                                    <span>{p.qty}x {p.name}</span>
                                                    <span className="font-medium">₹{(p.price * p.qty).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex-grow">
                                    <label htmlFor="adminNotes" className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Admin Notes / Rejection Reason
                                    </label>
                                    <textarea
                                        id="adminNotes"
                                        rows="4"
                                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Add notes for the user (required if rejecting)..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        disabled={selectedPrescription.status !== 'Pending'}
                                    />
                                </div>

                                {selectedPrescription.status === 'Pending' && (
                                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4">
                                        <button
                                            onClick={() => handleAction('Rejected')}
                                            disabled={actionLoading || !adminNotes.trim()}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-white dark:bg-gray-800 border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            {actionLoading ? 'Saving...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleAction('Approved')}
                                            disabled={actionLoading}
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            {actionLoading ? 'Saving...' : 'Approve'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPrescriptions;
