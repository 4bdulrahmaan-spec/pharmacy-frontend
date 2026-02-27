import { Link, useLocation } from 'react-router-dom';
import { Home, Stethoscope, PawPrint, ShoppingCart, User, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

const BottomTabBar = () => {
    const location = useLocation();
    const { cartInfo, userInfo } = useStore();

    // Map routes to active tab highlights
    const isActive = (path) => location.pathname === path;

    // Determine cart badge count
    const cartCount = cartInfo?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 absolute bottom-0 w-full z-50">
            <div className="flex justify-around items-center h-16 px-2">

                {/* Home */}
                <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                    <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                {/* Medicines */}
                <Link to="/medicines" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/medicines') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                    <Stethoscope className={`w-6 h-6 ${isActive('/medicines') ? 'fill-current' : ''}`} strokeWidth={isActive('/medicines') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Pharmacy</span>
                </Link>

                {/* Pet Shop */}
                <Link to="/pet-shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/pet-shop') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                    <PawPrint className={`w-6 h-6 ${isActive('/pet-shop') ? 'fill-current' : ''}`} strokeWidth={isActive('/pet-shop') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Pet Shop</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive('/cart') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                    <div className="relative">
                        <ShoppingCart className={`w-6 h-6 ${isActive('/cart') ? 'fill-current' : ''}`} strokeWidth={isActive('/cart') ? 2.5 : 2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Cart</span>
                </Link>

                {/* Profile / Admin */}
                {userInfo?.isAdmin ? (
                    <Link to="/admin/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/admin') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                        <ShieldAlert className={`w-6 h-6 ${location.pathname.startsWith('/admin') ? 'fill-current' : ''}`} strokeWidth={location.pathname.startsWith('/admin') ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Admin</span>
                    </Link>
                ) : (
                    <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                        <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Profile</span>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default BottomTabBar;
