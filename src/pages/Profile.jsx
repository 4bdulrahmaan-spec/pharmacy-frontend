import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, useStore } from '../store';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { Package, User } from 'lucide-react';

const Profile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState('');

    const [prescriptions, setPrescriptions] = useState([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
    const [errorPrescriptions, setErrorPrescriptions] = useState('');

    const navigate = useNavigate();
    const { userInfo, login, addToCart } = useStore();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            setName(userInfo.name);
            setEmail(userInfo.email);
            fetchMyOrders();
            fetchMyPrescriptions();
        }
    }, [navigate, userInfo]);

    const fetchMyOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
            setLoadingOrders(false);
        } catch (err) {
            setErrorOrders(err.response?.data?.message || err.message);
            setLoadingOrders(false);
        }
    };

    const fetchMyPrescriptions = async () => {
        try {
            const { data } = await api.get('/prescriptions/my');
            setPrescriptions(data);
            setLoadingPrescriptions(false);
        } catch (err) {
            setErrorPrescriptions(err.response?.data?.message || err.message);
            setLoadingPrescriptions(false);
        }
    };

    const handleAddPrescriptionToCart = (rx) => {
        if (!rx.products || rx.products.length === 0) return;

        rx.products.forEach(p => {
            addToCart({ ...p.product, qty: p.qty });
        });

        navigate('/cart');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.put('/users/profile', { id: userInfo._id, name, email, password });

            // Update local storage and store state
            const updatedUserInfo = { ...userInfo, name: data.name, email: data.email, token: data.token };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            useStore.setState({ userInfo: updatedUserInfo });

            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setMessage(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 px-4 py-4">
            <div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-primary-600" /> My Profile
                    </h2>

                    {message && <Message variant="danger">{message}</Message>}
                    {success && <Message variant="success">Profile Updated</Message>}
                    {loading && <Loader />}

                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" placeholder="Leave blank to keep current" className="input-field mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                            <input type="password" placeholder="Leave blank to keep current" className="input-field mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <button type="submit" className="w-full btn-primary py-2 mt-4">Update Profile</button>
                    </form>
                </div>
            </div>

            <div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary-600" /> My Orders
                    </h2>

                    {loadingOrders ? (
                        <Loader />
                    ) : errorOrders ? (
                        <Message variant="danger">{errorOrders}</Message>
                    ) : orders.length === 0 ? (
                        <Message variant="info">You do not have any orders yet.</Message>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID</th>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Total</th>
                                        <th scope="col" className="px-6 py-3">Paid</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {order._id.substring(0, 10)}...
                                            </td>
                                            <td className="px-6 py-4">{order.createdAt.substring(0, 10)}</td>
                                            <td className="px-6 py-4">₹{order.totalPrice}</td>
                                            <td className="px-6 py-4">
                                                {order.isPaid ? (
                                                    <span className="text-green-500 font-medium">{order.paidAt.substring(0, 10)}</span>
                                                ) : (
                                                    <span className="text-red-500 font-medium">No</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/order/${order._id}`} className="btn-secondary py-1 px-3 text-xs">
                                                    Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MY PRESCRIPTIONS SECTION */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary-600" /> My Prescriptions
                    </h2>

                    {loadingPrescriptions ? (
                        <Loader />
                    ) : errorPrescriptions ? (
                        <Message variant="danger">{errorPrescriptions}</Message>
                    ) : prescriptions.length === 0 ? (
                        <Message variant="info">You have not uploaded any prescriptions.</Message>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((rx) => (
                                <div key={rx._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 dark:bg-gray-800/50">
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                                        {rx.imageUrl.includes('.pdf') ? (
                                            <span className="text-xs font-bold text-gray-500">PDF Document</span>
                                        ) : (
                                            <img src={rx.imageUrl} alt="Prescription" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on {new Date(rx.createdAt).toLocaleDateString()}</p>
                                                <span className={`px-2 py-1 mt-1 inline-block rounded text-xs font-bold ${rx.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    rx.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    Status: {rx.status}
                                                </span>
                                            </div>
                                            {rx.status === 'Approved' && rx.products && rx.products.length > 0 && (
                                                <button
                                                    onClick={() => handleAddPrescriptionToCart(rx)}
                                                    className="btn-primary py-2 px-4 whitespace-nowrap"
                                                >
                                                    Add All to Cart
                                                </button>
                                            )}
                                        </div>

                                        {rx.adminNotes && (
                                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-2 text-sm text-red-700 dark:text-red-400">
                                                <strong>Notes:</strong> {rx.adminNotes}
                                            </div>
                                        )}

                                        {rx.products && rx.products.length > 0 && rx.status === 'Approved' && (
                                            <div className="mt-2 text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700">
                                                <strong className="text-gray-700 dark:text-gray-300">Prescribed Items:</strong>
                                                <ul className="mt-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                                                    {rx.products.map(p => (
                                                        <li key={p._id}>{p.qty}x {p.product?.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
