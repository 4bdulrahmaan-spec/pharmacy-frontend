import axios from 'axios';
import { create } from 'zustand';

// Axios Instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://pharmacy-backend-nine.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use((config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('userInfo');
            useStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --------- Zustand Store ---------

export const useStore = create((set, get) => ({
    // User State
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    login: async (email, password) => {
        try {
            const { data } = await api.post('/users/login', { email, password });
            set({ userInfo: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    },
    googleLogin: async (tokenId) => {
        try {
            const { data } = await api.post('/users/google', { tokenId });
            set({ userInfo: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || "Google Login Failed" };
        }
    },
    logout: () => {
        set({ userInfo: null });
        localStorage.removeItem('userInfo');
    },

    // Cart State
    cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
    shippingAddress: JSON.parse(localStorage.getItem('shippingAddress')) || {},
    paymentMethod: 'Razorpay',

    addToCart: (item, qty = 1) => {
        const { cartItems } = get();
        const existItem = cartItems.find((x) => x.product === item.product);

        if (existItem) {
            const newItems = cartItems.map((x) =>
                x.product === existItem.product ? { ...item, qty } : x
            );
            set({ cartItems: newItems });
            localStorage.setItem('cartItems', JSON.stringify(newItems));
        } else {
            const newItems = [...cartItems, { ...item, qty }];
            set({ cartItems: newItems });
            localStorage.setItem('cartItems', JSON.stringify(newItems));
        }
    },

    removeFromCart: (id) => {
        const { cartItems } = get();
        const newItems = cartItems.filter((x) => x.product !== id);
        set({ cartItems: newItems });
        localStorage.setItem('cartItems', JSON.stringify(newItems));
    },

    saveShippingAddress: (data) => {
        set({ shippingAddress: data });
        localStorage.setItem('shippingAddress', JSON.stringify(data));
    },

    clearCart: () => {
        set({ cartItems: [] });
        localStorage.removeItem('cartItems');
    }
}));
