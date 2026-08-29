import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .trim()
    .min(2,  { message: "Name must be at least 2 characters." })
    .max(80, { message: "Name must not exceed 80 characters." })
    .refine((v) => !/<[^>]*>/.test(v), {
      message: "Name contains invalid characters.",
    }),

  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .email({ message: "A valid email address is required." })
    .max(120, { message: "Email must not exceed 120 characters." })
    .toLowerCase(),

  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(10,   { message: "Message must be at least 10 characters." })
    .max(1200, { message: "Message must not exceed 1200 characters." }),
});

export const chatSchema = z.object({
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(1,   { message: "Message cannot be empty." })
    .max(5000, { message: "Message must not exceed 5000 characters." })
    .refine((v) => v.length > 0, { message: "Message cannot be blank." }),
  history: z.array(z.any()).optional(),
});

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&",  "&amp;")
    .replaceAll("<",  "&lt;")
    .replaceAll(">",  "&gt;")
    .replaceAll('"',  "&quot;")
    .replaceAll("'",  "&#039;");
}

export function sanitizeChatMessage(message) {
  return message
    .replace(/ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi, "[removed]")
    .replace(/you\s+are\s+now\s+(?:a|an)\s+/gi,                           "[removed]")
    .replace(/pretend\s+(?:you\s+are|to\s+be)\s+/gi,                      "[removed]")
    .replace(/act\s+as\s+(?:a|an)\s+/gi,                                   "[removed]")
    .replace(/system\s*:\s*/gi,                                            "[removed]")
    .replace(/\bDAN\b/g,                                                   "[removed]")
    .trim();
}
