import { Link } from 'react-router-dom';
import { useStore } from '../store';

const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20style%3D%22background%3A%23f3f4f6%22%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

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
                    src={product.imageUrl === 'no-photo.jpg' ? FALLBACK_IMAGE : product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                />
                {product.discount > 0 && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                        {product.discount}% OFF
                    </div>
                )}
                {product.requiresPrescription && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                        Rx
                    </div>
                )}
            </Link>

            <div className="p-3 flex flex-col flex-grow">
                <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight h-8">{product.name}</h3>
                </Link>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 flex-grow">{product.description}</p>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                        {product.stock === 0 ? (
                            <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                        ) : (
                            <span className="text-sm text-green-600 font-medium">In Stock</span>
                        )}
                    </div>

                    <button
                        disabled={product.stock === 0}
                        onClick={handleAddToCart}
                        className="btn-primary py-1 sm:py-1.5 px-2 sm:px-3 text-xs w-full ml-2"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
