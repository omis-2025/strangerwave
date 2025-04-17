import { db } from './db';
import { translationCache, supportedLanguages, translationMetrics, messages } from '@shared/schema';
import { and, eq, sql } from 'drizzle-orm';

// Language detection regular expressions (simplified)
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

/**
 * Simple language detection and translation service
 * This is a placeholder implementation until we integrate with an external API
 */
class BasicTranslationProvider implements TranslationProvider {
  /**
   * Detect the language of a text
   * This is a simplified implementation that will be replaced with a more robust solution
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim().length < 3) {
      return 'en'; // Default to English for very short texts
    }

    // Simple pattern matching for common words
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    // Default to English if no patterns match
    return 'en';
  }

  /**
   * Translate text from source language to target language
   * This placeholder implementation only handles a few common phrases
   * and will be replaced with a real translation service
   */
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // Return original text if source and target languages are the same
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Check translation cache first
    const cached = await this.checkCache(text, sourceLanguage, targetLanguage);
    if (cached) {
      return cached;
    }

    // Placeholder translations for common phrases (English to Spanish example)
    if (sourceLanguage === 'en' && targetLanguage === 'es') {
      const translations: Record<string, string> = {
        'hello': 'hola',
        'hi': 'hola',
        'how are you': 'cómo estás',
        'good morning': 'buenos días',
        'good afternoon': 'buenas tardes', 
        'good evening': 'buenas noches',
        'thank you': 'gracias',
        'yes': 'sí',
        'no': 'no',
        'please': 'por favor',
        'sorry': 'lo siento',
        'goodbye': 'adiós',
        'bye': 'adiós'
      };

      // Try to match simple phrases
      const lowerText = text.toLowerCase();
      for (const [eng, spa] of Object.entries(translations)) {
        if (lowerText === eng || lowerText.includes(` ${eng} `)) {
          const translated = text.replace(new RegExp(`\\b${eng}\\b`, 'gi'), spa);
          // Store in cache
          await this.storeInCache(text, sourceLanguage, targetLanguage, translated);
          return translated;
        }
      }
    }

    // For now, if we can't translate, return original with a note
    const result = `${text} [Translation not available: ${sourceLanguage} → ${targetLanguage}]`;
    await this.storeInCache(text, sourceLanguage, targetLanguage, result);
    
    return result;
  }

  /**
   * Check if a translation exists in the cache
   */
  private async checkCache(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string | null> {
    try {
      const start = performance.now();
      const [cached] = await db
        .select({ translatedText: translationCache.translatedText })
        .from(translationCache)
        .where(
          and(
            eq(translationCache.sourceText, text),
            eq(translationCache.sourceLanguage, sourceLanguage),
            eq(translationCache.targetLanguage, targetLanguage)
          )
        )
        .limit(1);

      if (cached) {
        // Update cache metrics
        await db.execute(
          sql`UPDATE translation_cache 
              SET use_count = use_count + 1, last_used_at = NOW() 
              WHERE source_text = ${text} 
              AND source_language = ${sourceLanguage} 
              AND target_language = ${targetLanguage}`
        );

        // Update metrics for this language pair
        await this.updateMetrics(sourceLanguage, targetLanguage, true, text.length, performance.now() - start);
        
        return cached.translatedText;
      }
      return null;
    } catch (error) {
      console.error('Error checking translation cache:', error);
      return null;
    }
  }

  /**
   * Store a translation in the cache
   */
  private async storeInCache(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    translatedText: string
  ): Promise<void> {
    try {
      await db
        .insert(translationCache)
        .values({
          sourceText,
          sourceLanguage,
          targetLanguage,
          translatedText,
        })
        .onConflictDoUpdate({
          target: [
            translationCache.sourceText,
            translationCache.sourceLanguage,
            translationCache.targetLanguage,
          ],
          set: {
            translatedText,
            lastUsedAt: new Date(),
            useCount: sql`use_count + 1`,
          },
        });
    } catch (error) {
      console.error('Error storing translation in cache:', error);
    }
  }

  /**
   * Update metrics for this translation
   */
  private async updateMetrics(
    sourceLanguage: string,
    targetLanguage: string,
    cacheHit: boolean,
    characterCount: number,
    latencyMs: number
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Try to update existing metrics for today
      const result = await db.execute(
        sql`INSERT INTO translation_metrics 
           (date, source_language, target_language, translation_count, cache_hit_count, api_call_count, character_count, average_latency_ms) 
           VALUES (${today.toISOString()}, ${sourceLanguage}, ${targetLanguage}, 1, ${cacheHit ? 1 : 0}, ${cacheHit ? 0 : 1}, ${characterCount}, ${Math.round(latencyMs)})
           ON CONFLICT (date, source_language, target_language) 
           DO UPDATE SET 
             translation_count = translation_metrics.translation_count + 1,
             cache_hit_count = translation_metrics.cache_hit_count + ${cacheHit ? 1 : 0},
             api_call_count = translation_metrics.api_call_count + ${cacheHit ? 0 : 1},
             character_count = translation_metrics.character_count + ${characterCount},
             average_latency_ms = (translation_metrics.average_latency_ms * translation_metrics.translation_count + ${Math.round(latencyMs)}) / (translation_metrics.translation_count + 1)`
      );
    } catch (error) {
      console.error('Error updating translation metrics:', error);
    }
  }
}

// Create singleton instance
const translationProvider = new BasicTranslationProvider();

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
      detectedLanguage,
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