import express from "express";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Twilio setup
  // In a real app, these would be in process.env
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  
  const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

  // API routes FIRST
  app.post("/api/notify", async (req, res) => {
    try {
      const { to, message } = req.body;
      
      if (!client) {
        console.warn("Twilio is not configured. Mocking WhatsApp message.");
        return res.json({ success: true, mocked: true, message: "Twilio not configured. Message mocked." });
      }

      // Twilio WhatsApp API requires 'whatsapp:' prefix
      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${twilioPhone}`,
        to: `whatsapp:${to}`
      });

      res.json({ success: true, messageId: response.sid });
    } catch (error: any) {
      console.error("Twilio Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
