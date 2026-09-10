import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      user_id,
      title,
      body,
    } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({
          error: "user_id is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!title || !body) {
      return new Response(
        JSON.stringify({
          error: "title and body are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const {
      data: devices,
      error: devicesError,
    } = await supabase
      .from("user_devices")
      .select("push_token, platform")
      .eq("user_id", user_id);

    if (devicesError) {
      throw new Error(
        `Failed to get device tokens: ${devicesError.message}`,
      );
    }

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No registered device found for this user",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const projectId =
      Deno.env.get("FIREBASE_PROJECT_ID");

    const clientEmail =
      Deno.env.get("FIREBASE_CLIENT_EMAIL");

    const privateKey =
      Deno.env.get("FIREBASE_PRIVATE_KEY");

    if (
      !projectId ||
      !clientEmail ||
      !privateKey
    ) {
      throw new Error(
        "Firebase service account secrets are missing",
      );
    }

    const accessToken =
      await getFirebaseAccessToken({
        clientEmail,
        privateKey,
      });

    const results = [];

    for (const device of devices) {
      const fcmToken = device.push_token;

      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token: fcmToken,
              notification: {
                title,
                body,
              },
              data: {
                type: "knowly_test",
              },
              android: {
                priority: "high",
                notification: {
                  sound: "default",
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: "default",
                  },
                },
              },
            },
          }),
        },
      );

      const responseText =
        await response.text();

      let responseData;

      try {
        responseData =
          JSON.parse(responseText);
      } catch {
        responseData = {
          raw: responseText,
        };
      }

      results.push({
        platform: device.platform,
        success: response.ok,
        response: responseData,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Notification request completed",
        results,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Push notification error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

async function getFirebaseAccessToken({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> {
  const now = Math.floor(
    Date.now() / 1000,
  );

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope:
      "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader =
    base64UrlEncode(
      JSON.stringify(header),
    );

  const encodedPayload =
    base64UrlEncode(
      JSON.stringify(payload),
    );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const formattedPrivateKey =
    privateKey.replace(/\\n/g, "\n");

  const keyData =
    pemToArrayBuffer(
      formattedPrivateKey,
    );

  const cryptoKey =
    await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

  const signature =
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(
        unsignedToken,
      ),
    );

  const encodedSignature =
    base64UrlEncodeBytes(
      new Uint8Array(signature),
    );

  const jwt =
    `${unsignedToken}.${encodedSignature}`;

  const tokenResponse =
    await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body:
          `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`,
      },
    );

  const tokenData =
    await tokenResponse.json();

  if (
    !tokenResponse.ok ||
    !tokenData.access_token
  ) {
    throw new Error(
      `Failed to get Firebase access token: ${JSON.stringify(tokenData)}`,
    );
  }

  return tokenData.access_token;
}

function base64UrlEncode(
  value: string,
): string {
  return base64UrlEncodeBytes(
    new TextEncoder().encode(value),
  );
}

function base64UrlEncodeBytes(
  bytes: Uint8Array,
): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(
  pem: string,
): ArrayBuffer {
  const base64 = pem
    .replace(
      /-----BEGIN PRIVATE KEY-----/g,
      "",
    )
    .replace(
      /-----END PRIVATE KEY-----/g,
      "",
    )
    .replace(/\s/g, "");

  const binaryString =
    atob(base64);

  const bytes = new Uint8Array(
    binaryString.length,
  );

  for (
    let i = 0;
    i < binaryString.length;
    i++
  ) {
    bytes[i] =
      binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}