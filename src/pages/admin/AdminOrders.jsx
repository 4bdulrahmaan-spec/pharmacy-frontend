import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useStore } from '../../store';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { userInfo } = useStore();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if (userInfo && userInfo.role === 'admin') {
            fetchOrders();
        }
    }, [userInfo]);

    if (!userInfo || userInfo.role !== 'admin') {
        return <Message variant="danger">Not authorized as admin</Message>;
    }

    return (
        <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>

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
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">DATE</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">TOTAL</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">PAID</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700">STATUS</th>
                                    <th scope="col" className="px-6 py-4 border-b dark:border-gray-700 flex justify-end">VIEW</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 border-b dark:border-gray-700 last:border-0 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {order._id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                            {order.user?.name || 'Deleted User'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.createdAt.substring(0, 10)}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            ₹{order.totalPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            {order.isPaid ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
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
                                            <div className="flex justify-end">
                                                <Link to={`/order/${order._id}`} className="text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 p-2 rounded-md transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
