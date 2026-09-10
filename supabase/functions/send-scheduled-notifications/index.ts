import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type NotificationSlot =
  | "morning"
  | "afternoon"
  | "evening";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    let body: {
      test?: boolean;
      slot?: NotificationSlot;
    } = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const isTestMode =
      body.test === true;

    let notificationSlot:
      | NotificationSlot
      | null = null;

    /*
     * TEST MODE
     *
     * Example:
     * {
     *   "test": true,
     *   "slot": "afternoon"
     * }
     */
    if (isTestMode) {
      notificationSlot =
        body.slot ?? "morning";

      console.log(
        `TEST MODE: ${notificationSlot}`,
      );
    } else {
      /*
       * PRODUCTION MODE
       *
       * Convert current time to India time.
       */
      const now = new Date();

      const indiaTime =
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          },
        ).formatToParts(now);

      const year = Number(
        indiaTime.find(
          part => part.type === "year",
        )?.value,
      );

      const month = Number(
        indiaTime.find(
          part => part.type === "month",
        )?.value,
      );

      const day = Number(
        indiaTime.find(
          part => part.type === "day",
        )?.value,
      );

      const hour = Number(
        indiaTime.find(
          part => part.type === "hour",
        )?.value,
      );

      const minute = Number(
        indiaTime.find(
          part => part.type === "minute",
        )?.value,
      );

      /*
       * We allow a 5-minute window.
       *
       * Morning:
       * 09:00 - 09:04
       *
       * Afternoon:
       * 14:00 - 14:04
       *
       * Evening:
       * 19:00 - 19:04
       */
      notificationSlot =
        getNotificationSlot(
          hour,
          minute,
        );

      if (!notificationSlot) {
        return jsonResponse({
          success: true,
          message:
            "No notification slot at this time.",
          processed: 0,
        });
      }

      console.log(
        `Production mode: ${notificationSlot}`,
      );

      /*
       * The date is calculated in India time.
       *
       * This is important because the database
       * server itself may use UTC.
       */
      console.log(
        `India date: ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );
    }

    /*
     * GET USERS WHO ENABLED THIS SLOT
     */
    const {
      data: users,
      error: usersError,
    } = await supabase
      .from("user_notification_settings")
      .select(
        `
          user_id,
          timezone,
          morning,
          afternoon,
          evening
        `,
      )
      .eq("enabled", true)
      .eq(
        notificationSlot,
        true,
      );

    if (usersError) {
      throw new Error(
        `Failed to load notification settings: ${usersError.message}`,
      );
    }

    if (!users || users.length === 0) {
      return jsonResponse({
        success: true,
        test: isTestMode,
        slot: notificationSlot,
        message:
          "No users found for this notification slot.",
        processed: 0,
      });
    }

    console.log(
      `Found ${users.length} users for ${notificationSlot}`,
    );

    /*
     * LOAD FACTS
     */
    const {
      data: facts,
      error: factsError,
    } = await supabase
      .from("facts")
      .select(
        "id, title, content, image_url, source",
      )
      .limit(50);

    if (factsError) {
      throw new Error(
        `Failed to load facts: ${factsError.message}`,
      );
    }

    if (!facts || facts.length === 0) {
      throw new Error(
        "No facts available in the facts table.",
      );
    }

    console.log(
      `Loaded ${facts.length} facts`,
    );

    /*
     * GET INDIA DATE
     *
     * Used as the notification date.
     */
    const todayParts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      ).formatToParts(
        new Date(),
      );

    const currentYear =
      todayParts.find(
        part => part.type === "year",
      )?.value;

    const currentMonth =
      todayParts.find(
        part => part.type === "month",
      )?.value;

    const currentDay =
      todayParts.find(
        part => part.type === "day",
      )?.value;

    const notificationDate =
      `${currentYear}-${currentMonth}-${currentDay}`;

    /*
     * SEND NOTIFICATION
     */
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
      try {
        /*
         * TEST MODE SHOULD NOT CREATE
         * A PERMANENT DELIVERY LOG.
         *
         * This allows us to test again.
         */
        if (!isTestMode) {
          /*
           * Check whether this user already received
           * this slot today.
           */
          const {
            data: existingLog,
            error: existingLogError,
          } = await supabase
            .from(
              "notification_delivery_log",
            )
            .select("id")
            .eq(
              "user_id",
              user.user_id,
            )
            .eq(
              "notification_date",
              notificationDate,
            )
            .eq(
              "notification_slot",
              notificationSlot,
            )
            .maybeSingle();

          if (existingLogError) {
            throw new Error(
              `Failed to check delivery log: ${existingLogError.message}`,
            );
          }

          if (existingLog) {
            console.log(
              `Skipping ${user.user_id} - already sent ${notificationSlot} notification today.`,
            );

            skipped++;
            continue;
          }
        }

        /*
         * PICK RANDOM FACT
         */
        const randomIndex =
          Math.floor(
            Math.random() *
              facts.length,
          );

        const fact =
          facts[randomIndex];

        /*
         * CALL EXISTING PUSH FUNCTION
         */
        const functionUrl =
          `${Deno.env.get(
            "SUPABASE_URL",
          )}/functions/v1/send-push-notification`;

        const response =
          await fetch(
            functionUrl,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${Deno.env.get(
                    "SUPABASE_SERVICE_ROLE_KEY",
                  )}`,
              },

              body: JSON.stringify({
                user_id:
                  user.user_id,

                title:
                  "Did you know? 🧠",

                body:
                  fact.title,
              }),
            },
          );

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            `Push notification failed: ${responseText}`,
          );
        }

        /*
         * ONLY CREATE DELIVERY LOG
         * AFTER FCM PUSH SUCCEEDED.
         */
        if (!isTestMode) {
          const {
            error: logError,
          } = await supabase
            .from(
              "notification_delivery_log",
            )
            .insert({
              user_id:
                user.user_id,

              notification_date:
                notificationDate,

              notification_slot:
                notificationSlot,

              fact_id:
                fact.id,

              sent_at:
                new Date().toISOString(),
            });

          if (logError) {
            /*
             * If another invocation already inserted
             * the same unique record, don't send again.
             */
            if (
              logError.code ===
              "23505"
            ) {
              console.log(
                `Duplicate prevented for ${user.user_id}`,
              );

              skipped++;
              continue;
            }

            throw new Error(
              `Failed to create delivery log: ${logError.message}`,
            );
          }
        }

        console.log(
          `Notification sent successfully to ${user.user_id}`,
        );

        processed++;
      } catch (error) {
        console.error(
          `Failed to send notification to ${user.user_id}:`,
          error,
        );

        failed++;
      }
    }

    return jsonResponse({
      success: true,
      test: isTestMode,
      slot: notificationSlot,
      notificationDate,
      totalUsers:
        users.length,
      processed,
      skipped,
      failed,
    });
  } catch (error) {
    console.error(
      "Scheduled notification error:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      500,
    );
  }
});


function getNotificationSlot(
  hour: number,
  minute: number,
):
  | NotificationSlot
  | null {
  /*
   * Morning:
   * 09:00 - 09:04
   */
  if (
    hour === 9 &&
    minute >= 0 &&
    minute <= 4
  ) {
    return "morning";
  }

  /*
   * Afternoon:
   * 14:00 - 14:04
   */
  if (
    hour === 14 &&
    minute >= 0 &&
    minute <= 4
  ) {
    return "afternoon";
  }

  /*
   * Evening:
   * 19:00 - 19:04
   */
  if (
    hour === 19 &&
    minute >= 0 &&
    minute <= 4
  ) {
    return "evening";
  }

  return null;
}


function jsonResponse(
  data: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    },
  );
}