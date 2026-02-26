import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, useStore } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { cartItems, shippingAddress, paymentMethod, clearCart } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Calculate prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2)); // 18% GST example
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

    useEffect(() => {
        if (!shippingAddress.street) {
            navigate('/shipping');
        } else if (!paymentMethod) {
            navigate('/payment');
        }
    }, [shippingAddress, paymentMethod, navigate]);

    const placeOrderHandler = async () => {
        try {
            setLoading(true);
            const { data } = await api.post('/orders', {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            });
            clearCart();
            setLoading(false);
            navigate(`/order/${data._id}`); // Navigate to order success/details page (To be created)
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8">
            <CheckoutSteps step1 step2 step3 step4 />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shipping Information</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Address: </strong>
                            {shippingAddress.street}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Method: </strong>
                            {paymentMethod}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
                        {cartItems.length === 0 ? (
                            <Message>Your cart is empty</Message>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                                        <img src={item.image === 'no-photo.jpg' ? 'https://via.placeholder.com/150' : item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                        <Link to={`/product/${item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 flex-1 line-clamp-2">
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
                                <span className="font-medium text-gray-900 dark:text-white">₹{itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax (GST)</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{taxPrice.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{totalPrice}</span>
                            </div>
                        </div>

                        {error && <Message variant="danger" className="mb-4">{error}</Message>}

                        <button
                            onClick={placeOrderHandler}
                            disabled={cartItems.length === 0 || loading}
                            className="w-full btn-primary py-3 text-lg flex justify-center items-center gap-2"
                        >
                            {loading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>}
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;
