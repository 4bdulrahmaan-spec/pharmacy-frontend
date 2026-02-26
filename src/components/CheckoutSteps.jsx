import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
    return (
        <div className="flex justify-center mb-8 w-full">
            <nav className="flex items-center w-full max-w-3xl justify-between">
                <div className={`flex flex-col items-center ${step1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${step1 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800 border-dashed'}`}>
                        1
                    </div>
                    {step1 ? (
                        <Link to="/login" className="text-sm font-medium hover:underline">Login</Link>
                    ) : (
                        <span className="text-sm font-medium">Login</span>
                    )}
                </div>

                <div className={`flex-1 h-0.5 mx-4 ${step2 ? 'bg-primary-600 transition-all duration-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                <div className={`flex flex-col items-center ${step2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${step2 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800 border-dashed'}`}>
                        2
                    </div>
                    {step2 ? (
                        <Link to="/shipping" className="text-sm font-medium hover:underline">Shipping</Link>
                    ) : (
                        <span className="text-sm font-medium">Shipping</span>
                    )}
                </div>

                <div className={`flex-1 h-0.5 mx-4 ${step3 ? 'bg-primary-600 transition-all duration-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                <div className={`flex flex-col items-center ${step3 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${step3 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800 border-dashed'}`}>
                        3
                    </div>
                    {step3 ? (
                        <Link to="/payment" className="text-sm font-medium hover:underline">Payment</Link>
                    ) : (
                        <span className="text-sm font-medium">Payment</span>
                    )}
                </div>

                <div className={`flex-1 h-0.5 mx-4 ${step4 ? 'bg-primary-600 transition-all duration-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                <div className={`flex flex-col items-center ${step4 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${step4 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800 border-dashed'}`}>
                        4
                    </div>
                    {step4 ? (
                        <Link to="/placeorder" className="text-sm font-medium hover:underline">Place Order</Link>
                    ) : (
                        <span className="text-sm font-medium">Place Order</span>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default CheckoutSteps;
