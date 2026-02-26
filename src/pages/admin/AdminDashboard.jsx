import { useState, useEffect } from 'react';
import { api, useStore } from '../../store';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { Users, Package, ShoppingCart, IndianRupee, Bell } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { userInfo } = useStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if (userInfo && userInfo.role === 'admin') {
            fetchStats();
        }
    }, [userInfo]);

    if (!userInfo || userInfo.role !== 'admin') {
        return <Message variant="danger">Not authorized as admin</Message>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Stat Cards */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <IndianRupee className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Sales</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalSales.toFixed(2)}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <ShoppingCart className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Orders</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Products</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Customers</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-red-500" /> Low Stock Alerts
                            </h2>
                            {stats.lowStockAlerts.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">All products have sufficient stock.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {stats.lowStockAlerts.map(item => (
                                        <li key={item._id} className="py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                                {item.stock} left
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                Pending Prescriptions ({stats.pendingPrescriptions})
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">You have {stats.pendingPrescriptions} prescriptions requiring verification.</p>
                            <button className="btn-secondary">View Prescriptions</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
