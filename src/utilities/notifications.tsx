import { getUserDefaultBool, setUserDefaultBool } from "./settings";

/**
 * Get the person's permission to send notification requests.
 *
 * @returns Promise containing the notification permission, or a rejection if
 * either the browser doesn't support notifications.
 */
export function getNotificationRequestPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(request => {
            setUserDefaultBool(
                "enablePushNotifications",
                request === "granted"
            );
            setUserDefaultBool("userDeniedNotification", request === "denied");
        });
        return Promise.resolve(Notification.permission);
    } else {
        console.warn(
            "Notifications aren't supported in this browser. The setting will be disabled."
        );
        setUserDefaultBool("enablePushNotifications", false);
        return Promise.reject(
            "Notifications are not supported in this browser."
        );
    }
}

/**
 * Get the browser's notification support
 * @returns Boolean value that determines whether the browser supports the Notification API
 */
export function browserSupportsNotificationRequests(): boolean {
    return "Notification" in window;
}

/**
 * Get the user default for sending push notifications
 * @returns Boolean value of `enablePushNotifications`
 */
export function canSendNotifications() {
    return (
        getUserDefaultBool("enablePushNotifications") &&
        Notification.permission === "granted"
    );
}

/**
 * Sends a push notification based on user preference
 * @param title The primary title of the push notification
 * @param body The contents of the push notification
 */
export function sendNotificationRequest(title: string, body: string) {
    if (canSendNotifications()) {
        let notif = new Notification(title, {
            body: body
        });

        notif.onclick = () => {
            window.focus();
        };
    } else {
        console.warn("The person has opted to not receive push notifications.");
    }
}
