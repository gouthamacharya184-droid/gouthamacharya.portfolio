@@
   (async () => {
     try {
-      // Wait at most 5 seconds for verification to succeed.
-      const verifyPromise = verifyTransport();
-      const timeoutPromise = new Promise((_, reject) =>
-        setTimeout(() => reject(new Error("smtp_verify_timeout")), 5_000).unref()
-      );
-      await Promise.race([verifyPromise, timeoutPromise]);
-      logger.info({ type: "smtp_verified" });
+      const verifyPromise = verifyTransport();
+      const timeoutPromise = new Promise((_, reject) =>
+        setTimeout(() => reject(new Error("smtp_verify_timeout")), 5_000).unref()
+      );
+      const ok = await Promise.race([verifyPromise, timeoutPromise]);
+      if (ok === true) {
+        logger.info({ type: "smtp_verified" });
+      } else {
+        logger.warn({ type: "smtp_unavailable", reason: "not_configured_or_verify_failed" });
+      }
     } catch (err) {
       // Don't crash — log and continue. The mailer will handle retries on send.
       logger.warn({ type: "smtp_unavailable", msg: err?.message || String(err) });
     }
   })();
*** End Patch
