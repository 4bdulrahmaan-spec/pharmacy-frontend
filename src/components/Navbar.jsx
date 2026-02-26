import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ShoppingCart, User, LogOut, Package, Moon, Sun } from 'lucide-react';

const Navbar = () => {
    const { userInfo, cartItems, logout } = useStore();
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl">
                    The Pharmacy & Pet Shop
                </Link>
                <div className="flex items-center space-x-6">
                    <Link to="/medicines" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Medicines</Link>
                    <Link to="/pet-shop" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Pet Shop</Link>

                    <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
                        <ShoppingCart className="w-6 h-6" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        )}
                    </Link>

                    {userInfo ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                                <User className="w-5 h-5" />
                                <span>{userInfo.name.split(' ')[0]}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-100 dark:border-gray-700">
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                                <Link to="/myorders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">My Orders</Link>
                                {userInfo.role === 'admin' && (
                                    <>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                                        <Link to="/admin/products" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Products</Link>
                                        <Link to="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Orders</Link>
                                    </>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary">Login</Link>
                    )}

                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
