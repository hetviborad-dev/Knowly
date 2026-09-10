import {Platform, PermissionsAndroid} from 'react-native';
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';


import {supabase} from '../lib/supabase';

const ANDROID_13_API_LEVEL = 33;

export const requestPushPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const androidVersion = Number(Platform.Version);

      // Android 12 / API 32 and below:
      // notification permission is granted at install time.
      if (androidVersion < ANDROID_13_API_LEVEL) {
        console.log(
          'Android version below 13. Notification permission is granted by default.',
        );

        return true;
      }

      // Android 13 / API 33 and above:
      // explicitly request POST_NOTIFICATIONS permission.
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (alreadyGranted) {
        console.log('Android notification permission already granted.');

        return true;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Allow notifications?',
          message:
            'Enable notifications to receive new facts, reminders, and important updates.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not now',
        },
      );

      const granted = result === PermissionsAndroid.RESULTS.GRANTED;

      console.log('Android notification permission:', result);

      return granted;
    }

    // iOS permission request.
    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    });

    console.log('iOS FCM permission status:', authStatus);

    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Push permission error:', error);

    return false;
  }
};

export const getAndSaveFCMToken = async (): Promise<string | null> => {
  try {
    console.log('Getting FCM token...');

    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Failed to get authenticated user:', userError);

      return null;
    }

    if (!user) {
      console.log('No authenticated user found.');

      return null;
    }

    console.log('Authenticated user:', user.id);

    const hasPermission = await requestPushPermission();

    if (!hasPermission) {
      console.log('Notification permission denied.');

      return null;
    }

    // Needed if Firebase auto-registration is disabled in native configuration.
    const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;

    if (!isRegistered) {
      await messaging().registerDeviceForRemoteMessages();
    }

    console.log('Getting device FCM token...');

    const token = await messaging().getToken();

    if (!token) {
      console.log('FCM token is empty.');

      return null;
    }

    console.log('FCM token received:', token);

    const {error: saveError} = await supabase
      .from('user_devices')
      .upsert(
        {
          user_id: user.id,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,push_token',
        },
      );

    if (saveError) {
      console.error('Failed to save FCM token:', saveError);

      return null;
    }

    console.log('FCM token saved to Supabase.');

    return token;
  } catch (error) {
    console.error('FCM token error:', error);

    return null;
  }
};

export const listenForFCMTokenRefresh = () => {
  return messaging().onTokenRefresh(async refreshedToken => {
    try {
      console.log('FCM token refreshed:', refreshedToken);

      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No signed-in user; refreshed token was not saved.');

        return;
      }

      const {error} = await supabase
        .from('user_devices')
        .upsert(
          {
            user_id: user.id,
            push_token: refreshedToken,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,push_token',
          },
        );

      if (error) {
        console.error('Failed to save refreshed FCM token:', error);
      }
    } catch (error) {
      console.error('FCM refresh-token listener error:', error);
    }
  });
};