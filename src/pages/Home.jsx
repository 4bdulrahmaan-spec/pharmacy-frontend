import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../store';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { ArrowRight, ShieldCheck, Heart, Truck } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch top 4 medicines
                const { data } = await api.get('/products?type=medicine&limit=4');
                setProducts(data.slice(0, 4));
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-primary-50 dark:bg-gray-800 rounded-3xl p-8 md:p-16 mb-16 shadow-inner border border-primary-100 dark:border-gray-700">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Your Health & <span className="text-primary-600">Your Pet's Happiness</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Get authentic medicines delivered to your doorstep. Upload prescriptions easily. Shop for your furry friends.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/medicines" className="btn-primary text-lg px-8 py-3 rounded-full flex items-center justify-center gap-2">
                            Order Medicines <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/pet-shop" className="btn-secondary text-lg px-8 py-3 rounded-full">
                            Shop Pet Supplies
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">100% Genuine</h3>
                    <p className="text-gray-600 dark:text-gray-400">All medicines are sourced from authorized distributors.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Fast Delivery</h3>
                    <p className="text-gray-600 dark:text-gray-400">Get your orders delivered safely and quickly to your door.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pet Care</h3>
                    <p className="text-gray-600 dark:text-gray-400">Everything your pet needs from food to grooming.</p>
                </div>
            </section>

            {/* Featured Products */}
            <section className="mb-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Featured Medicines</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Essential medicines for your daily needs.</p>
                    </div>
                    <Link to="/medicines" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1 hidden sm:flex">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error}</Message>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-6 text-center sm:hidden">
                    <Link to="/medicines" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center justify-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Prescription Banner */}
            <section className="bg-blue-600 dark:bg-blue-800 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Have a Prescription?</h2>
                    <p className="text-blue-100 text-lg mb-0">Upload your prescription and let our pharmacists arrange your medicines. We'll review it and create an order for you.</p>
                </div>
                <Link to="/upload-prescription" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-md hover:bg-blue-50 hover:shadow-lg transition-all whitespace-nowrap">
                    Upload Now
                </Link>
            </section>
        </div>
    );
};

export default Home;
