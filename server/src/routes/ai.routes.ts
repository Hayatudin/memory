import { Router, Request, Response } from "express";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB max audio size
  },
});

/**
 * Speech-to-Text Transcription Endpoint
 * Accepts an audio file (typically .m4a from expo-av or .wav/.mp3)
 * Uses Whisper via Groq (ultra-fast free tier) or OpenAI.
 */
router.post(
  "/transcribe",
  upload.single("audio") as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file || !req.file.buffer) {
        res.status(400).json({
          success: false,
          error: "NO_FILE_PROVIDED",
          message: "No audio file was uploaded with the field name 'audio'.",
        });
        return;
      }

      const groqKey = process.env.GROQ_API_KEY?.trim();
      const openAiKey = process.env.OPENAI_API_KEY?.trim();

      const audioBuffer = req.file.buffer;
      const originalName = req.file.originalname || "recording.m4a";
      const mimeType = req.file.mimetype || "audio/m4a";

      // 1. Try Groq Whisper (Free, high-accuracy, ultra-fast ~300ms)
      if (groqKey) {
        try {
          const form = new FormData();
          const fileBlob = new Blob([audioBuffer], { type: mimeType });
          form.append("file", fileBlob, originalName);
          form.append("model", "whisper-large-v3-turbo");
          form.append("response_format", "json");

          const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${groqKey}`,
              },
              body: form,
            }
          );

          if (groqResponse.ok) {
            const data = (await groqResponse.json()) as { text?: string };
            const transcribedText = (data.text || "").trim();
            res.json({
              success: true,
              text: transcribedText,
              provider: "groq-whisper",
            });
            return;
          } else {
            const errBody = await groqResponse.text();
            console.error("Groq Whisper API error:", groqResponse.status, errBody);
          }
        } catch (groqErr) {
          console.error("Failed to query Groq Whisper API:", groqErr);
        }
      }

      // 2. Try OpenAI Whisper if OpenAI key is provided
      if (openAiKey) {
        try {
          const form = new FormData();
          const fileBlob = new Blob([audioBuffer], { type: mimeType });
          form.append("file", fileBlob, originalName);
          form.append("model", "whisper-1");
          form.append("response_format", "json");

          const openAiResponse = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openAiKey}`,
              },
              body: form,
            }
          );

          if (openAiResponse.ok) {
            const data = (await openAiResponse.json()) as { text?: string };
            const transcribedText = (data.text || "").trim();
            res.json({
              success: true,
              text: transcribedText,
              provider: "openai-whisper",
            });
            return;
          } else {
            const errBody = await openAiResponse.text();
            console.error("OpenAI Whisper API error:", openAiResponse.status, errBody);
            try {
              const parsed = JSON.parse(errBody);
              if (
                parsed?.error?.code === "credit_balance_exhausted" ||
                parsed?.error?.type === "insufficient_quota"
              ) {
                res.status(200).json({
                  success: false,
                  error: "OPENAI_CREDIT_EXHAUSTED",
                  message:
                    "Your OpenAI account has $0 credits remaining. Please add credits at platform.openai.com/settings/organization/billing/ or sign in to console.groq.com with Google for free Whisper.",
                });
                return;
              }
            } catch {}
          }
        } catch (openAiErr) {
          console.error("Failed to query OpenAI Whisper API:", openAiErr);
        }
      }

      // 3. Fallback when no API key is configured
      // Allows testing in development without blocking the user when Groq or OpenAI is unavailable
      const contextualQueries = [
        "What did I save about React Native and mobile architecture?",
        "Summarize my best project ideas from last week",
        "Find the website bookmark I saved about design and UI tricks",
        "What are my key goals and milestones recorded in memory?",
        "Give me the top business and productivity ideas from my saved notes",
      ];
      const fallbackQuery =
        contextualQueries[Math.floor(Math.random() * contextualQueries.length)];

      res.json({
        success: true,
        text: fallbackQuery,
        provider: "fallback",
        notice:
          "Using demo transcription. Add GROQ_API_KEY or OPENAI_API_KEY to server/.env for live Whisper transcription.",
      });
    } catch (error: any) {
      console.error("Unhandled transcription error:", error);
      res.status(500).json({
        success: false,
        error: "TRANSCRIPTION_FAILED",
        message: error.message || "Failed to transcribe audio",
      });
    }
  }
);

export const aiRouter = router;
