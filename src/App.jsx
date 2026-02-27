import { Routes, Route } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import BottomTabBar from './components/BottomTabBar';
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
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import Chatbot from './components/Chatbot';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black/90 flex justify-center items-start lg:py-8 transition-colors duration-200">
            {/* The "Phone" Container */}
            <div className="w-full max-w-full lg:w-[400px] shrink-0 bg-gray-50 dark:bg-gray-900 min-h-[100dvh] lg:min-h-0 lg:h-[850px] flex flex-col relative lg:rounded-[3rem] lg:shadow-2xl lg:border-[8px] border-black overflow-hidden lg:ring-1 lg:ring-gray-800">

                <TopAppBar />

                {/* Main Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto w-full no-scrollbar relative mb-[64px] pb-4">
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
                        <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
                    </Routes>
                </main>
                <div className="absolute bottom-0 left-0 right-0 z-50">
                    <BottomTabBar />
                </div>

                <div className="absolute bottom-20 right-4 z-50">
                    <Chatbot />
                </div>
            </div>
        </div>
    );
}

export default App;
