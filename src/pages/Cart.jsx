import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import Message from '../components/Message';
import { Trash2 } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart } = useStore();

    const checkoutHandler = () => {
        navigate('/login?redirect=shipping');
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <Message>
                    Your cart is empty. <Link to="/" className="font-bold">Go Back</Link>
                </Message>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {cartItems.map((item) => (
                            <div key={item.product} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                                    <img src={item.image === 'no-photo.jpg' ? 'https://via.placeholder.com/150' : item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                    <Link to={`/product/${item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 flex-1 line-clamp-2">
                                        {item.name}
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4">
                                    <div className="font-bold whitespace-nowrap">₹{item.price}</div>

                                    <select
                                        value={item.qty}
                                        onChange={(e) => addToCart(item, Number(e.target.value))}
                                        className="input-field w-20 py-1"
                                    >
                                        {[...Array(Math.min(item.countInStock || 10, 10)).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">Order Summary</h2>

                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600 dark:text-gray-400">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="font-medium text-gray-900 dark:text-white">Calculated at checkout</span>
                            </div>

                            <div className="flex justify-between mb-6">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={checkoutHandler}
                                disabled={cartItems.length === 0}
                                className="w-full btn-primary py-3 text-lg"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
