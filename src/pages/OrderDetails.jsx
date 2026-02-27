import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, useStore } from '../store';
import Message from '../components/Message';
import Loader from '../components/Loader';

const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20style%3D%22background%3A%23f3f4f6%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
const ENDPOINT = 'http://localhost:5000';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingDeliver, setLoadingDeliver] = useState(false);
    const [loadingPay, setLoadingPay] = useState(false);
    const { userInfo } = useStore();

    const trackingSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentStepIndex = order.status ? trackingSteps.indexOf(order.status) : 0;

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const socket = io(ENDPOINT);

        socket.emit('join_order', id);

        socket.on('status_updated', (newStatus) => {
            console.log(`Live order status update to: ${newStatus}`);
            fetchOrder(); // Refetch to get the latest order data
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const updateStatusHandler = async (status) => {
        try {
            setLoadingDeliver(true);
            await api.put(`/orders/${order._id}/status`, { status });
            fetchOrder();
            setLoadingDeliver(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingDeliver(false);
        }
    };

    const markAsPaidHandler = async () => {
        try {
            setLoadingPay(true);
            await api.put(`/orders/${order._id}/pay`, { id: 'simulated_payment', status: 'COMPLETED', update_time: new Date().toISOString(), email_address: userInfo.email });
            fetchOrder();
            setLoadingPay(false);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            setLoadingPay(false);
        }
    };

    return loading ? (
        <Loader />
    ) : error ? (
        <Message variant="danger">{error}</Message>
    ) : (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Order {order._id}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Order Tracking UI */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Order Status</h2>

                        {order.status === 'Cancelled' ? (
                            <Message variant="danger">This order has been cancelled.</Message>
                        ) : (
                            <div className="px-4 pb-8">
                                <div className="flex items-center w-full">
                                    {trackingSteps.map((step, index) => (
                                        <div key={step} className="flex items-center flex-1 last:flex-none">
                                            {/* Dot and Label Container */}
                                            <div className="relative flex flex-col items-center">
                                                {/* Dot */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ring-4 ring-white dark:ring-gray-800 ${index <= currentStepIndex ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                    {index < currentStepIndex || order.status === 'Delivered' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                {/* Label */}
                                                <div className={`absolute top-10 whitespace-nowrap text-xs sm:text-sm font-bold ${index <= currentStepIndex ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {step}
                                                </div>
                                            </div>

                                            {/* Connecting Line (Don't render for the last item) */}
                                            {index < trackingSteps.length - 1 && (
                                                <div className={`flex-1 h-1 -ml-2 -mr-2 z-0 ${index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shipping Information</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            <strong>Name: </strong> {order.user.name}<br />
                            <strong>Email: </strong> <a href={`mailto:${order.user.email}`} className="text-primary-600 hover:underline">{order.user.email}</a><br />
                            <strong>Address: </strong>
                            {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        {order.status === 'Delivered' ? (
                            <Message variant="success">Delivered on {order.updatedAt.substring(0, 10)}</Message>
                        ) : (
                            <Message variant="info">Status: {order.status}</Message>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            <strong>Method: </strong>
                            {order.paymentMethod}
                        </p>
                        {order.isPaid ? (
                            <Message variant="success">Paid on {order.paidAt.substring(0, 10)}</Message>
                        ) : (
                            <Message variant="warning">Not Paid</Message>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
                        {order.orderItems.length === 0 ? (
                            <Message>Order is empty</Message>
                        ) : (
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                        <img
                                            src={item.image === 'no-photo.jpg' ? FALLBACK_IMAGE : item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                        />
                                        <Link to={`/product/${item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                                            {item.name}
                                        </Link>
                                        <div className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {item.qty} x ₹{item.price} = ₹{(item.qty * item.price).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Items</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{order.shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax (GST)</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{order.taxPrice.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* In a real app, Razorpay button would go here if not paid */}
                        {!order.isPaid && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-center mb-6">
                                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">Simulated Payment System</p>
                                <button onClick={markAsPaidHandler} disabled={loadingPay} className="btn-primary w-full py-2">
                                    {loadingPay ? 'Processing...' : `Pay ₹${order.totalPrice.toFixed(2)}`}
                                </button>
                            </div>
                        )}

                        {userInfo && userInfo.role === 'admin' && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Admin Controls</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => updateStatusHandler('Processing')}
                                        disabled={loadingDeliver || order.status === 'Processing' || order.status === 'Delivered'}
                                        className={`w-full py-2 rounded font-medium ${order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        Mark as Processing
                                    </button>
                                    <button
                                        onClick={() => updateStatusHandler('Shipped')}
                                        disabled={loadingDeliver || order.status === 'Shipped' || order.status === 'Delivered'}
                                        className={`w-full py-2 rounded font-medium ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        Mark as Shipped
                                    </button>
                                    <button
                                        onClick={() => updateStatusHandler('Delivered')}
                                        disabled={loadingDeliver || order.status === 'Delivered' || !order.isPaid}
                                        className={`w-full py-2 rounded font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {loadingDeliver ? 'Updating...' : 'Mark as Delivered (Requires Payment)'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
