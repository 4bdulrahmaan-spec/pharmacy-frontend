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
        <div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 mb-8 text-center border border-yellow-100 dark:border-yellow-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pet Shop</h1>
                <p className="text-gray-600 dark:text-gray-400">Everything your furry friend needs: food, toys, and healthcare.</p>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : products.length === 0 ? (
                <Message variant="info">No pet products available at the moment.</Message>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PetShop;
