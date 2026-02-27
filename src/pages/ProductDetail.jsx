import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, useStore } from '../store';
import Loader from '../components/Loader';
import Message from '../components/Message';
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22500%22%20style%3D%22background%3A%23f3f4f6%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2248%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qty, setQty] = useState(1);

    const { addToCart } = useStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
            countInStock: product.stock
        }, qty);
        navigate('/cart');
    };

    return (
        <div className="px-4 py-4 pb-20">
            <Link className="btn-secondary mb-6" to="/">
                Go Back
            </Link>

            {
                loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error}</Message>
                ) : (
                    <div className="flex flex-col gap-6 px-4 py-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                            <img
                                src={product.imageUrl === 'no-photo.jpg' ? FALLBACK_IMAGE : product.imageUrl}
                                alt={product.name}
                                className="max-h-96 object-contain rounded-xl"
                                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                            {product.brand && <p className="text-sm text-gray-500 mb-4 border-b pb-4">Brand: {product.brand}</p>}

                            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                                {product.description}
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                                </div>

                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                {product.requiresPrescription && (
                                    <div className="mb-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <span className="font-bold">Note:</span> This product requires a valid prescription to be uploaded during checkout.
                                    </div>
                                )}

                                {product.stock > 0 && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                        <select
                                            value={qty}
                                            onChange={(e) => setQty(Number(e.target.value))}
                                            className="input-field w-24"
                                        >
                                            {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={addToCartHandler}
                                    disabled={product.stock === 0}
                                    className="w-full btn-primary py-3 text-lg"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default ProductDetail;
