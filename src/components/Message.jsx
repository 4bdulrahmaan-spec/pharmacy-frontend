const Message = ({ variant = 'info', children }) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'success':
                return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'warning':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        }
    };

    return (
        <div className={`p-4 mb-4 border rounded-md text-sm ${getVariantClasses()}`} role="alert">
            {children}
        </div>
    );
};

export default Message;
