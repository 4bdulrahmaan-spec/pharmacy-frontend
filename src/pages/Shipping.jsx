import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';

const Shipping = () => {
    const { shippingAddress, saveShippingAddress } = useStore();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || '',
    });

    const submitHandler = (e) => {
        e.preventDefault();
        saveShippingAddress(address);
        navigate('/payment');
    };

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <CheckoutSteps step1 step2 />

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Shipping Address</h1>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                        <input
                            type="text"
                            name="street"
                            required
                            className="input-field"
                            value={address.street}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            required
                            className="input-field"
                            value={address.city}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                        <input
                            type="text"
                            name="postalCode"
                            required
                            className="input-field"
                            value={address.postalCode}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <input
                            type="text"
                            name="country"
                            required
                            className="input-field"
                            value={address.country}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 text-lg">
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Shipping;
