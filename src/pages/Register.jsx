import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, useStore } from '../store';
import Message from '../components/Message';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin, userInfo } = useStore();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            await api.post('/users/register', { name, email, phone, password });
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create an Account
                    </h2>
                </div>

                {message && <Message variant="warning">{message}</Message>}
                {error && <Message variant="danger">{error}</Message>}

                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" required className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" required className="input-field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input type="text" required className="input-field mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" required className="input-field mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                            <input type="password" required className="input-field mt-1" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="w-full btn-primary py-3 text-base">Register</button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or register with</span>
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
                                setMessage('Google registration failed');
                            }}
                            useOneTap
                            containerProps={{ className: "w-full flex justify-center" }}
                        />
                    </div>
                </form>

                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
