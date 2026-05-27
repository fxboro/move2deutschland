import express from "express";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import path from "path";
import rateLimit from "express-rate-limit";

// Rate limiter for notify endpoint (max 10 requests per 15 minutes per IP)
const notifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: "Too many notifications sent from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

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
  app.post("/api/notify", notifyLimiter, async (req, res) => {
    try {
      const { to, message } = req.body;
      
      // Validation check
      if (!to || typeof to !== "string") {
        return res.status(400).json({ success: false, error: "Missing or invalid 'to' field. It must be a valid phone string." });
      }
      
      // Validate phone number formatting (e.g. E.164 format digits optionally starting with +, 7-15 digits total)
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      // Clean target by removing spaces/hyphens for comparison if needed
      const cleanPhone = to.replace(/[\s-()]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ success: false, error: "Invalid phone number format. It must follow E.164 standard." });
      }

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Missing or empty 'message' field." });
      }

      if (message.length > 500) {
        return res.status(400).json({ success: false, error: "Message too long. Max limit is 500 characters." });
      }

      if (!client) {
        console.warn("Twilio is not configured. Mocking WhatsApp message.");
        return res.json({ success: true, mocked: true, message: "Twilio not configured. Message mocked." });
      }

      // Twilio WhatsApp API requires 'whatsapp:' prefix
      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${twilioPhone}`,
        to: `whatsapp:${cleanPhone}`
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
