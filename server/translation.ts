import { db } from './db';
import { translationCache, supportedLanguages, translationMetrics, messages } from '@shared/schema';
import { and, eq, sql } from 'drizzle-orm';
import { TranslationServiceClient } from '@google-cloud/translate';

// Language detection regular expressions (simplified) - retained for fallback
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  en: /\b(the|is|are|am|was|were|have|has|had|can|will|should|would|this|that|these|those)\b/i,
  es: /\b(el|la|los|las|es|son|está|están|tiene|tienen|haber|hacer|ser|estar|este|esta|estos|estas)\b/i,
  fr: /\b(le|la|les|est|sont|être|avoir|faire|ce|cette|ces|celui|celle|ceux|celles)\b/i,
  de: /\b(der|die|das|ist|sind|sein|haben|machen|werden|dieser|diese|dieses|diese)\b/i,
  it: /\b(il|lo|la|i|gli|le|è|sono|essere|avere|fare|questo|questa|questi|queste)\b/i,
  pt: /\b(o|a|os|as|é|são|estar|ser|ter|fazer|este|esta|estes|estas)\b/i,
  ru: /\b(я|ты|он|она|оно|мы|вы|они|это|эти|тот|та|те|быть|есть|иметь)\b/i,
  zh: /[\u4e00-\u9fff]+/,
  ja: /[\u3040-\u309f\u30a0-\u30ff]+/,
  ko: /[\uac00-\ud7a3]+/,
  ar: /[\u0600-\u06ff]+/,
};

/**
 * Interface for translation providers
 */
interface TranslationProvider {
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<string>;
  detectLanguage: (text: string) => Promise<string>;
}


class GoogleCloudTranslationProvider implements TranslationProvider {
  private translationClient: TranslationServiceClient;

  constructor(credentials: string) {
    this.translationClient = new TranslationServiceClient({
      credentials: JSON.parse(credentials)
    });
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const [result] = await this.translationClient.detectLanguage({
        parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
        content: text,
      });
      return result.languages[0].languageCode;
    } catch (error) {
      console.error('Google Cloud Translation - Language Detection Error:', error);
      //Fallback to basic detection
      return this.basicDetectLanguage(text);
    }
  }


  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      const [response] = await this.translationClient.translateText({
        parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
        contents: [text],
        targetLanguageCode: targetLanguage,
        sourceLanguageCode: sourceLanguage,
      });
      return response.translations[0].translatedText;
    } catch (error) {
      console.error('Google Cloud Translation - Translation Error:', error);
      // Fallback to basic translation if Google Cloud fails
      return this.basicTranslate(text, sourceLanguage, targetLanguage);
    }
  }

  // Basic fallback methods in case Google Cloud Translate is unavailable

  private basicDetectLanguage(text: string): string {
    if (!text || text.trim().length < 3) {
      return 'en'; // Default to English for very short texts
    }
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    return 'en';
  }


  private basicTranslate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): string {
      if (sourceLanguage === targetLanguage) {
        return text;
      }
      return `${text} [Translation not available: ${sourceLanguage} → ${targetLanguage}]`;
  }
}

// Create singleton instance using environment variables for credentials.  Adjust as needed.
const translationProvider = new GoogleCloudTranslationProvider(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');


/**
 * Get all supported languages
 */
export async function getSupportedLanguages() {
  try {
    const langs = await db
      .select()
      .from(supportedLanguages)
      .where(eq(supportedLanguages.isActive, true));
    return langs;
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return [];
  }
}

/**
 * Detect the language of a text
 */
export async function detectLanguage(text: string): Promise<string> {
  return translationProvider.detectLanguage(text);
}

/**
 * Translate a message between languages
 */
export async function translateMessage(
  messageId: number,
  targetLanguage: string
): Promise<string | null> {
  try {
    // Get the message
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    // If message already has a detected language, use it
    const sourceLanguage = message.detectedLanguage || await detectLanguage(message.content);

    // If message is already in target language, return content
    if (sourceLanguage === targetLanguage) {
      return message.content;
    }

    // Translate the message
    const translatedText = await translationProvider.translate(
      message.content,
      sourceLanguage,
      targetLanguage
    );

    // Update message with detected language if not set
    if (!message.detectedLanguage) {
      await db
        .update(messages)
        .set({ detectedLanguage: sourceLanguage })
        .where(eq(messages.id, messageId));
    }

    return translatedText;
  } catch (error) {
    console.error('Error translating message:', error);
    return null;
  }
}

/**
 * Process a new message for translation
 * If source and target languages differ, translates and marks message
 */
export async function processNewMessage(
  messageContent: string,
  senderId: number,
  recipientId: number
): Promise<{ content: string; isTranslated: boolean; detectedLanguage: string }> {
  try {
    // Detect language of message
    const detectedLanguage = await detectLanguage(messageContent);

    // Get user language preferences
    const [sender] = await db
      .select({ preferredLanguage: sql`preferred_language` })
      .from(sql`users`)
      .where(sql`id = ${senderId}`);

    const [recipient] = await db
      .select({ preferredLanguage: sql`preferred_language` })
      .from(sql`users`)
      .where(sql`id = ${recipientId}`);

    const senderLanguage = sender?.preferredLanguage || 'en';
    const recipientLanguage = recipient?.preferredLanguage || 'en';

    // If languages are the same, no translation needed
    if (recipientLanguage === detectedLanguage) {
      return {
        content: messageContent,
        isTranslated: false,
        detectedLanguage
      };
    }

    // Translate message
    const translatedContent = await translationProvider.translate(
      messageContent,
      detectedLanguage || 'en',
      recipientLanguage
    );

    return {
      content: translatedContent,
      isTranslated: true,
      detectedLanguage
    };
  } catch (error) {
    console.error('Error processing message for translation:', error);
    return {
      content: messageContent,
      isTranslated: false,
      detectedLanguage: 'en'
    };
  }
}

/**
 * Update user language preference
 */
export async function updateUserLanguagePreference(
  userId: number,
  language: string
): Promise<boolean> {
  try {
    await db.execute(
      sql`UPDATE users SET preferred_language = ${language} WHERE id = ${userId}`
    );
    return true;
  } catch (error) {
    console.error('Error updating user language preference:', error);
    return false;
  }
}

/**
 * Get translation metrics for a date range
 */
export async function getTranslationMetrics(
  startDate: Date,
  endDate: Date
) {
  try {
    return await db
      .select()
      .from(translationMetrics)
      .where(
        and(
          sql`date >= ${startDate}`,
          sql`date <= ${endDate}`
        )
      );
  } catch (error) {
    console.error('Error fetching translation metrics:', error);
    return [];
  }
}

// Export the main functionality
export default {
  getSupportedLanguages,
  detectLanguage,
  translateMessage,
  processNewMessage,
  updateUserLanguagePreference,
  getTranslationMetrics
};