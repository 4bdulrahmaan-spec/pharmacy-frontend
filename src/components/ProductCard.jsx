import { Link } from 'react-router-dom';
import { useStore } from '../store';

const ProductCard = ({ product }) => {
    const { addToCart } = useStore();

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart({
            product: product._id,
            name: product.name,
            image: product.imageUrl,
            price: product.price,
        }, 1);
    };

    return (
        <div className="card flex flex-col h-full group">
            <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-square">
                <img
                    src={product.imageUrl === 'no-photo.jpg' ? 'https://via.placeholder.com/300?text=No+Image' : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.discount}% OFF
                    </div>
                )}
                {product.requiresPrescription && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Rx Required
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 flex-grow">{product.description}</p>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                        {product.stock === 0 ? (
                            <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                        ) : (
                            <span className="text-sm text-green-600 font-medium">In Stock</span>
                        )}
                    </div>

                    <button
                        disabled={product.stock === 0}
                        onClick={handleAddToCart}
                        className="btn-primary py-1.5 px-3 text-sm"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
