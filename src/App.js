/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape */
import React, { useEffect, useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const App = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    endpoint: "N/A",
    p256dh: "N/A",
    auth: "N/A",
  });

  const subscribeUserToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log(`Notification permission: ${permission}`);

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        console.log("Service Worker ready");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.REACT_APP_VAPID_PUBLIC_KEY
          ),
        });

        console.log("Push subscription created:", subscription);

        const key = subscription.getKey ? subscription.getKey("p256dh") : null;
        const auth = subscription.getKey ? subscription.getKey("auth") : null;

        console.log("p256dh key:", key);
        console.log("Auth key:", auth);

        if (key && auth) {
          const p256dh = btoa(
            String.fromCharCode.apply(null, new Uint8Array(key))
          );
          const authKey = btoa(
            String.fromCharCode.apply(null, new Uint8Array(auth))
          );

          console.log("Encoded p256dh key:", p256dh);
          console.log("Encoded Auth key:", authKey);

          setSubscriptionInfo({
            endpoint: subscription.endpoint,
            p256dh: p256dh,
            auth: authKey,
          });
        } else {
          console.error("Failed to retrieve keys from subscription");
        }

        console.log("Subscribed successfully!");
      }
    } catch (error) {
      console.error(`Subscription failed: ${error.message}`);
    }
  };

  const isPushManagerActive = (pushManager) => {
    if (!pushManager) {
      if (!window.navigator.standalone) {
        console.warn(
          "PushManager is not active | Please add app to home screen"
        );
      } else {
        console.warn("PushManager is not active");
      }
    } else {
      console.log("PushManager is active");
    }
  };

  const registerSW = async () => {
    try {
      let swRegistration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      if (swRegistration) {
        console.log("Service Worker is active and running");
        let pushManager = swRegistration.pushManager;
        isPushManagerActive(pushManager);
      } else {
        console.error("Service Worker is not active");
      }
    } catch (error) {
      console.error(`Service Worker registration failed: ${error.message}`);
    }
  };

  useEffect(() => {
    registerSW();
  }, []);

  return (
    <Grid style={{ margin: "20px" }}>
      <Typography variant="h1">Test Push Notification</Typography>

      <Button variant="contained" color="primary" onClick={subscribeUserToPush}>
        Click here to subscribe
      </Button>

      <Grid container spacing={2} style={{ marginTop: "15px" }}>
        <Grid item xs={12}>
          <TextField
            label="Endpoint"
            value={subscriptionInfo.endpoint}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(subscriptionInfo.endpoint);
                  }}
                >
                  Copy
                </Button>
              ),
            }}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Auth key"
            value={subscriptionInfo.auth}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(subscriptionInfo.auth);
                  }}
                >
                  Copy
                </Button>
              ),
            }}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="p256dh key"
            value={subscriptionInfo.p256dh}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(subscriptionInfo.p256dh);
                  }}
                >
                  Copy
                </Button>
              ),
            }}
            variant="outlined"
            fullWidth
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default App;
