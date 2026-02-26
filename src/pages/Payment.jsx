import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';

const Payment = () => {
    const { shippingAddress, paymentMethod, useStore } = useStore.getState();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(paymentMethod || 'Razorpay');

    useEffect(() => {
        if (!shippingAddress.street) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        useStore.setState({ paymentMethod: payment });
        navigate('/placeorder');
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <CheckoutSteps step1 step2 step3 />

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Payment Method</h1>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => setPayment('Razorpay')}>
                            <input
                                type="radio"
                                id="Razorpay"
                                name="paymentMethod"
                                value="Razorpay"
                                checked={payment === 'Razorpay'}
                                onChange={(e) => setPayment(e.target.value)}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="Razorpay" className="ml-3 block text-lg font-medium text-gray-900 dark:text-white cursor-pointer w-full">
                                Razorpay (Credit Card / UPI)
                            </label>
                        </div>

                        <div className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => setPayment('COD')}>
                            <input
                                type="radio"
                                id="COD"
                                name="paymentMethod"
                                value="COD"
                                checked={payment === 'COD'}
                                onChange={(e) => setPayment(e.target.value)}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label htmlFor="COD" className="ml-3 block text-lg font-medium text-gray-900 dark:text-white cursor-pointer w-full">
                                Cash on Delivery
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg mt-8">
                        Continue to Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payment;
