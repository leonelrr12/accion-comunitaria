"use server";

import { prisma } from "@/lib/prisma";

export async function getUnreadNotifications(userId: number) {
    try {
        return await prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markAsRead(notificationId: number) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
}

export async function markAllAsRead(userId: number) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false };
    }
}

export async function createSystemNotification(userId: number, title: string, message: string, link?: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                link
            }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}
