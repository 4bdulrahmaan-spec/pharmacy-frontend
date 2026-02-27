import { useState, useEffect } from 'react';
import { api } from '../store';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const PetShop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPetProducts = async () => {
            try {
                const { data } = await api.get('/products?type=pet');
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchPetProducts();
    }, []);

    return (
        <div className="px-4 py-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl p-6 mb-6 text-center border border-yellow-100 dark:border-yellow-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pet Shop</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Everything your furry friend needs.</p>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : products.length === 0 ? (
                <Message variant="info">No pet products available at the moment.</Message>
            ) : (
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PetShop;
