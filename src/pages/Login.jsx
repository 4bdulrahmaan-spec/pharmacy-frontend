import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import Message from '../components/Message';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin, userInfo } = useStore();

    const redirectParam = location.search ? location.search.split('=')[1] : '/';
    const redirect = redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;

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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center flex-col items-center gap-4">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const result = await googleLogin(credentialResponse.credential);
                                if (!result.success) {
                                    setMessage(result.error);
                                }
                            }}
                            onError={() => {
                                setMessage('Google login failed');
                            }}
                            useOneTap
                            containerProps={{ className: "w-full flex justify-center" }}
                        />
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
