import { useState, useEffect } from 'react';
import { api } from '../store';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Search } from 'lucide-react';

const Medicines = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [sort]);

    const fetchProducts = async (searchKw = keyword) => {
        try {
            setLoading(true);
            let url = '/products?type=medicine';
            if (searchKw) url += `&keyword=${searchKw}`;
            if (sort) url += `&sort=${sort}`;

            const { data } = await api.get(url);
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();
        fetchProducts(keyword);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Medicines</h1>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={submitHandler} className="w-full md:w-1/2 relative">
                    <input
                        type="text"
                        className="input-field pl-10 w-full"
                        placeholder="Search medicines by name..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <button type="submit" className="hidden">Search</button>
                </form>

                <div className="w-full md:w-auto flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort By:</label>
                    <select
                        className="input-field"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="">Latest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : products.length === 0 ? (
                <Message variant="info">No medicines found matching your criteria.</Message>
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

export default Medicines;
