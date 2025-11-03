
import React from 'react';
import { Notification } from '../types';
import NotificationToast from './NotificationToast';

interface NotificationContainerProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, setNotifications }) => {
    const handleDismiss = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3">
            {notifications.map(notification => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onDismiss={() => handleDismiss(notification.id)}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
