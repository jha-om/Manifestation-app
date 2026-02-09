import Constants from 'expo-constants';

export async function getNotificationsModule(): Promise<typeof import('expo-notifications') | null> {
    // Only block in Expo Go — standalone/dev builds should proceed
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
        console.log('[Notifications] Running in Expo Go — notifications disabled');
        return null;
    }

    try {
        const mod = await import('expo-notifications');
        // Verify the native module is actually available
        if (!mod || !mod.scheduleNotificationAsync) {
            console.log('[Notifications] Module imported but native methods unavailable');
            return null;
        }
        console.log('[Notifications] Module loaded successfully');
        return mod;
    } catch (e) {
        console.log('[Notifications] Failed to load module:', e);
        return null;
    }
}
