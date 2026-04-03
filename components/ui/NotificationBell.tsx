"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "../../app/actions/notifications";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
    const router = useRouter();
    const currentUser = useAppStore(state => state.currentUser);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!currentUser) return;
        const data = await getUnreadNotifications(currentUser.id);
        setNotifications(data);
    };

    // Load initial directly and then poll every 30s
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        await markAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
        await markAllAsRead(currentUser.id);
        setNotifications([]);
        setIsOpen(false);
    };

    const handleNotificationClick = async (notif: any) => {
        await handleMarkAsRead(notif.id);
        setIsOpen(false);
        if (notif.link) {
            router.push(notif.link);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors rounded-full hover:bg-slate-100"
            >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800">Notificaciones</h3>
                        {notifications.length > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:text-blue-800"
                            >
                                Marcar todo leído
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center flex flex-col items-center">
                                <Check className="h-8 w-8 text-emerald-400 mb-2 opacity-50" />
                                <p className="text-sm text-slate-500 font-medium">Estás al día.</p>
                                <p className="text-xs text-slate-400 mt-1">No tienes mensajes nuevos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className={`px-4 py-3 hover:bg-blue-50/50 transition-colors flex items-start gap-3 relative group ${notif.link ? 'cursor-pointer' : ''}`}
                                        onClick={() => notif.link && handleNotificationClick(notif)}
                                    >
                                        <div className="mt-1 sticky top-0">
                                            <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notif.id);
                                            }}
                                            className="absolute right-3 top-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                                            title="Descartar"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
