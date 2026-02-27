import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, useStore } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22150%22%20height%3D%22150%22%20style%3D%22background%3A%23f3f4f6%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const placeOrderHandler = async () => {
        if (paymentMethod === 'Razorpay') {
            await handleRazorpayPayment();
        } else {
            await executeOrderCreation(); // COD or other
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        const res = await loadRazorpayScript();

        if (!res) {
            setError("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order on Backend
            const { data: order } = await api.post('/payment/create-order', {
                amount: totalPrice,
            });

            if (!order) {
                setError("Server error. Are you online?");
                setLoading(false);
                return;
            }

            // 2. Initialize Razorpay Window
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "Pharmacy & Pet Shop",
                description: "Test Transaction",
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.data.verified) {
                            await executeOrderCreation({
                                id: response.razorpay_payment_id,
                                status: 'Completed',
                                update_time: new Date().toISOString()
                            });
                        } else {
                            setError("Payment verification failed!");
                        }
                    } catch (err) {
                        setError("Payment verification error");
                    }
                },
                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                setError("Payment Failed: " + response.error.description);
            });
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Something went wrong during payment initialization");
        } finally {
            setLoading(false);
        }
    };

    const executeOrderCreation = async (paymentResult = null) => {
        try {
            setLoading(true);
            const orderData = {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            };

            if (paymentResult) {
                orderData.paymentResult = paymentResult;
                orderData.isPaid = true;
                orderData.paidAt = Date.now();
            }

            const { data } = await api.post('/orders', orderData);
            clearCart();
            setLoading(false);
            navigate(`/order/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-4 pb-20">
            <CheckoutSteps step1 step2 step3 step4 />
            <div className="flex flex-col gap-6 mt-6 sm:mt-8">
                <div className="space-y-6">
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

                <div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                            {paymentMethod === 'Razorpay' ? 'Proceed to Pay' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default PlaceOrder;
