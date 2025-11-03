
import React, { useEffect } from 'react';
import { Notification } from '../types';
import { BellIcon, XIcon } from './icons';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss]);

    return (
        <div
            className="backdrop-blur-xl bg-white/50 p-4 rounded-xl shadow-lg border border-white/40 flex items-start gap-4 animate-fade-in-right"
            role="alert"
            aria-live="assertive"
        >
            <div className="flex-shrink-0 pt-0.5">
                <BellIcon className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-grow">
                <p className="text-sm font-medium text-slate-800">{String(notification.message)}</p>
            </div>
            <div className="flex-shrink-0 ml-4">
                <button
                    onClick={onDismiss}
                    className="p-1 rounded-full text-slate-400 hover:bg-black/10 hover:text-slate-600 transition-colors"
                    aria-label="Dismiss notification"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
            <style>{`
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotificationToast;
