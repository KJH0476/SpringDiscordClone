import React from 'react';

const NotificationBadge = () => {

    return (
        <span
            className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 border-2 border-white dark:border-gray-800 text-white text-xs font-bold z-10">
        </span>
    );
};

export default NotificationBadge;