import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../store';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { ArrowRight, ShieldCheck, Heart, Truck, Stethoscope } from 'lucide-react';

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
            <section className="bg-primary-50 dark:bg-gray-800 rounded-b-[2.5rem] p-4 pt-6 pb-6 mb-6 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Health & <span className="text-primary-600 block mt-1">Happiness</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Authentic medicines & pet supplies delivered to you!
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link to="/medicines" className="btn-primary w-full py-3.5 text-base rounded-2xl flex items-center justify-center gap-2">
                            Order Medicines <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/pet-shop" className="btn-secondary w-full py-3.5 text-base rounded-2xl">
                            Shop Pet Supplies
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features (Mobile Stacked or Horizontal Scroll) */}
            <section className="px-4 mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Why Choose Us</h2>
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 -mx-4 px-4 snap-x">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[240px] snap-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-primary-600 dark:text-primary-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Genuine</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">Sourced directly from authorized distributors.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[240px] snap-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-primary-600 dark:text-primary-400">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Fast Delivery</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">Quick and safe delivery to your door.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[240px] snap-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-primary-600 dark:text-primary-400">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Pet Care</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">Everything your pet needs.</p>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="px-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Medicines</h2>
                    <Link to="/medicines" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                        View All
                    </Link>
                </div>

                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error}</Message>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Prescription Banner */}
            <section className="px-4 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Stethoscope className="w-32 h-32" />
                    </div>

                    <h2 className="text-xl font-bold mb-2 relative z-10">Have a Prescription?</h2>
                    <p className="text-blue-100 text-xs mb-5 relative z-10">Upload your prescription and let our pharmacists arrange your medicines.</p>

                    <Link to="/upload-prescription" className="bg-white text-blue-700 font-bold py-3 text-sm rounded-xl shadow-md block w-full relative z-10 text-center">
                        Upload Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
