import OpenAI from "openai";
import { storage } from "./storage";

// Initialize OpenAI client
const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// Moderation thresholds (1-5 scale)
const AUTO_BAN_THRESHOLD = 4.5;     // Increased threshold for auto-bans
const WARNING_THRESHOLD = 3.5;      // Threshold for user warnings
const REVIEW_THRESHOLD = 2.5;       // Threshold for manual review

// Logging categories
const LOG_LEVELS = {
  SEVERE: 'SEVERE',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

export interface ModerationResult {
  isFlagged: boolean;
  toxicityScore: number;
  categories: {
    sexual: boolean;
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    violence: boolean;
    selfPromotion: boolean;
  }
  autoBanned: boolean;
}

/**
 * Analyzes message content for harmful content using OpenAI's moderation API
 */
export async function moderateMessage(
  userId: number,
  content: string
): Promise<ModerationResult | null> {
  // Skip moderation if OpenAI is not configured
  if (!openai) {
    console.warn("OpenAI API key not configured. Message moderation skipped.");
    return null;
  }

  try {
    // First check using OpenAI's built-in moderation endpoint
    const moderationResponse = await openai.moderations.create({
      input: content,
    });

    const result = moderationResponse.results[0];
    const isFlagged = result.flagged;

    // If basic moderation flags it, do a deeper analysis with GPT-4
    if (isFlagged) {
      // Get a detailed toxicity analysis
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a content moderation AI. Analyze the message for toxic content and provide:
            1. A toxicity score from 1-5 where 5 is most toxic
            2. Categories of toxicity detected: sexual, hate, harassment, self-harm, violence, self-promotion
            3. Return ONLY a JSON object with this structure: 
            { 
              "toxicityScore": number, 
              "categories": {
                "sexual": boolean,
                "hate": boolean,
                "harassment": boolean,
                "selfHarm": boolean,
                "violence": boolean,
                "selfPromotion": boolean
              }
            }`
          },
          {
            role: "user",
            content: content
          }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the analysis
      const analysis = JSON.parse(analysisResponse.choices[0].message.content);

      // Determine if the user should be auto-banned
      const toxicityScore = analysis.toxicityScore;
      const autoBan = toxicityScore >= AUTO_BAN_THRESHOLD;

      // Handle different moderation cases
      if (autoBan) {
        await storage.banUser(userId);
        console.log(LOG_LEVELS.SEVERE, `User ${userId} auto-banned. Score: ${toxicityScore}`);
      } else if (toxicityScore >= WARNING_THRESHOLD) {
        const warning = await storage.warnUser(userId, {
          reason: "Your message contained inappropriate content",
          toxicityScore,
          categories: analysis.categories
        });

        // Send warning notification to user
        sendToUser(userId, {
          type: "warning",
          warning: {
            id: warning.id,
            reason: warning.reason,
            timestamp: warning.timestamp,
            toxicityScore: warning.toxicityScore
          }
        });

        console.log(LOG_LEVELS.WARNING, `User ${userId} warned. Score: ${toxicityScore}`);
      } else if (toxicityScore >= REVIEW_THRESHOLD) {
        await storage.flagForReview(userId, content, toxicityScore);
        console.log(LOG_LEVELS.INFO, `User ${userId} flagged for review. Score: ${toxicityScore}`);
      }

      // Return the detailed result
      return {
        isFlagged: true,
        toxicityScore,
        categories: analysis.categories,
        autoBanned: autoBan
      };
    }

    // If not flagged by initial moderation, return clean result
    return {
      isFlagged: false,
      toxicityScore: 1, // Lowest toxicity score
      categories: {
        sexual: false,
        hate: false,
        harassment: false,
        selfHarm: false,
        violence: false,
        selfPromotion: false
      },
      autoBanned: false
    };

  } catch (error) {
    console.error("Error performing message moderation:", error);
    return null;
  }
}


// Placeholder for sendToUser function -  Replace with actual implementation
async function sendToUser(userId: number, notification: any) {
  console.log(`Sending notification to user ${userId}:`, notification);
  // Add your notification sending logic here (e.g., using email, in-app messages, etc.)
}