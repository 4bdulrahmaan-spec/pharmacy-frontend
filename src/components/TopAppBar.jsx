import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import { useStore } from '../store';

const TopAppBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useStore();

    // Pages where we don't want a back button (Root pages)
    const isRootPage = ['/', '/medicines', '/pet-shop', '/cart', '/profile'].includes(location.pathname);

    // Dynamic title based on route
    const getTitle = () => {
        if (location.pathname === '/') return 'Pharmacy & Pets';
        if (location.pathname === '/medicines') return 'Medicines';
        if (location.pathname === '/pet-shop') return 'Pet Shop';
        if (location.pathname === '/cart') return 'My Cart';
        if (location.pathname === '/profile') return 'Profile';
        if (location.pathname.startsWith('/product/')) return 'Product Details';
        if (location.pathname === '/login') return 'Login';
        if (location.pathname === '/register') return 'Sign Up';
        if (location.pathname === '/shipping') return 'Shipping';
        if (location.pathname === '/payment') return 'Payment';
        if (location.pathname === '/placeorder') return 'Checkout';
        if (location.pathname.startsWith('/admin')) return 'Admin Panel';
        return 'Pharmacy & Pets';
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left Action (Back or Empty) */}
                <div className="w-10">
                    {!isRootPage && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Center Title */}
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 text-center">
                    {getTitle()}
                </h1>

                {/* Right Action (Action icon or empty) */}
                <div className="w-10 flex justify-end">
                    {userInfo && isRootPage && (
                        <button className="p-2 -mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopAppBar;
