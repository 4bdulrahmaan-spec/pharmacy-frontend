import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import Message from '../components/Message';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { login, userInfo } = useStore();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (!result.success) {
            setMessage(result.error);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Log in to your account
                    </h2>
                </div>

                {message && <Message variant="danger">{message}</Message>}

                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="input-field mt-1"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field mt-1"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="w-full btn-primary py-3 text-base">
                            Log In
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
