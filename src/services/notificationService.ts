import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from "@notifee/react-native";

import { supabase } from "../lib/supabase";

const CHANNEL_ID = "knowly-facts";

const NOTIFICATION_IDS = {
  morning: "knowly-morning",
  afternoon: "knowly-afternoon",
  evening: "knowly-evening",
};

export type NotificationTimes = {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
};

export const createNotificationChannel =
  async () => {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Knowly Facts",
      importance: AndroidImportance.HIGH,
    });
  };

export const requestNotificationPermission =
  async (): Promise<boolean> => {
    const settings =
      await notifee.requestPermission();

    return (
      settings.authorizationStatus ===
        AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus ===
        AuthorizationStatus.PROVISIONAL
    );
  };

const getNextTriggerTime = (
  hour: number,
  minute: number = 0,
) => {
  const now = new Date();

  const triggerDate = new Date();

  triggerDate.setHours(
    hour,
    minute,
    0,
    0,
  );

  if (
    triggerDate.getTime() <=
    now.getTime()
  ) {
    triggerDate.setDate(
      triggerDate.getDate() + 1,
    );
  }

  return triggerDate.getTime();
};

const scheduleDailyNotification =
  async (
    id: string,
    hour: number,
    title: string,
    body: string,
  ) => {
    const trigger = {
      type: TriggerType.TIMESTAMP,

      timestamp:
        getNextTriggerTime(hour),

      repeatFrequency:
        RepeatFrequency.DAILY,
    };

    console.log(
      "Creating notification:",
      {
        id,
        hour,
        trigger,
      },
    );

    await notifee.createTriggerNotification(
      {
        id,
        title,
        body,

        android: {
          channelId: CHANNEL_ID,

          pressAction: {
            id: "default",
          },
        },

        ios: {
          sound: "default",
        },
      },

      trigger,
    );
  };

export const cancelAllKnowlyNotifications =
  async () => {
    await notifee.cancelNotification(
      NOTIFICATION_IDS.morning,
    );

    await notifee.cancelNotification(
      NOTIFICATION_IDS.afternoon,
    );

    await notifee.cancelNotification(
      NOTIFICATION_IDS.evening,
    );
  };

export const scheduleKnowlyNotifications =
  async ({
    morning,
    afternoon,
    evening,
  }: NotificationTimes) => {
    await createNotificationChannel();

    await cancelAllKnowlyNotifications();

    if (morning) {
      await scheduleDailyNotification(
        NOTIFICATION_IDS.morning,
        9,
        "Knowly 🧠",
        "Did you know? Discover something interesting today.",
      );
    }

    if (afternoon) {
      await scheduleDailyNotification(
        NOTIFICATION_IDS.afternoon,
        14,
        "Knowly 🧠",
        "Here is your afternoon fact. Learn something new!",
      );
    }

    if (evening) {
      await scheduleDailyNotification(
        NOTIFICATION_IDS.evening,
        19,
        "Knowly 🧠",
        "End your day with an interesting fact.",
      );
    }
  };

export const setupKnowlyNotifications =
  async (
    times: NotificationTimes,
  ): Promise<boolean> => {
    const permission =
      await requestNotificationPermission();

    if (!permission) {
      return false;
    }

    await scheduleKnowlyNotifications(
      times,
    );

    return true;
  };

export const showTestNotification =
  async () => {
    await createNotificationChannel();

    await notifee.displayNotification({
      title: "Knowly 🧠",
      body: "Your notifications are working!",

      android: {
        channelId: CHANNEL_ID,

        pressAction: {
          id: "default",
        },
      },
    });
  };

export const getScheduledKnowlyNotifications =
  async () => {
    const notifications =
      await notifee.getTriggerNotifications();

    console.log(
      "Scheduled Knowly notifications:",
      notifications,
    );

    return notifications;
  };

/**
 * Get a random fact from one of
 * the user's selected categories.
 */
export const getPersonalizedFact =
  async () => {
    try {
      console.log(
        "Fetching personalized fact...",
      );

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log(
          "No authenticated user found.",
        );

        return null;
      }

      console.log(
        "User ID:",
        user.id,
      );

      const {
        data,
        error,
      } = await supabase
        .from("facts")
        .select(
          `
            id,
            title,
            content,
            image_url,
            source,
            category_id
          `,
        )
        .in(
          "category_id",
          (
            await supabase
              .from("user_categories")
              .select("category_id")
              .eq(
                "user_id",
                user.id,
              )
          ).data?.map(
            item =>
              item.category_id,
          ) ?? [],
        )
        .limit(50);

      if (error) {
        console.error(
          "Failed to fetch personalized facts:",
          error,
        );

        return null;
      }

      if (
        !data ||
        data.length === 0
      ) {
        console.log(
          "No personalized facts found.",
        );

        return null;
      }

      const randomFact =
        data[
          Math.floor(
            Math.random() *
              data.length,
          )
        ];

      console.log(
        "Selected personalized fact:",
        randomFact,
      );

      return randomFact;
    } catch (error) {
      console.error(
        "Personalized fact error:",
        error,
      );

      return null;
    }
  };

/**
 * Show a personalized fact
 * as an immediate notification.
 */
export const showPersonalizedFactNotification =
  async () => {
    try {
      const fact =
        await getPersonalizedFact();

      if (!fact) {
        return false;
      }

      await createNotificationChannel();

      await notifee.displayNotification({
        title:
          `🧠 ${fact.title}`,

        body:
          fact.content,

        android: {
          channelId: CHANNEL_ID,

          pressAction: {
            id: "default",
          },
        },

        ios: {
          sound: "default",
        },
      });

      console.log(
        "Personalized fact notification displayed!",
      );

      return true;
    } catch (error) {
      console.error(
        "Personalized notification error:",
        error,
      );

      return false;
    }
  };