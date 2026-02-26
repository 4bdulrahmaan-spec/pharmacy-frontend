import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Medicines from './pages/Medicines';
import PetShop from './pages/PetShop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Shipping from './pages/Shipping';
import Payment from './pages/Payment';
import PlaceOrder from './pages/PlaceOrder';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import UploadPrescription from './pages/UploadPrescription';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/medicines" element={<Medicines />} />
                    <Route path="/pet-shop" element={<PetShop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/placeorder" element={<PlaceOrder />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/order/:id" element={<OrderDetails />} />
                    <Route path="/upload-prescription" element={<UploadPrescription />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    {/* Add more routes here later */}
                </Routes>
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} The Pharmacy & Pet Shop. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default App;
