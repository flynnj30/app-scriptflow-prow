// ================================================================
// AI PROMPTS - Centralized prompt templates for Gemini AI
// ================================================================

/**
 * AI Prompts Module
 * Centralized location for all AI prompts used in the application
 */
const AIPrompts = {
    // ================================================================
    // SYSTEM PROMPTS
    // ================================================================

    SYSTEM_TRANSCRIPT_ANALYSIS: `You are an AI assistant for a CRM system. Analyze conversation transcripts and extract structured data with confidence scores.`,
    SYSTEM_EMAIL_GENERATION: `You are an AI assistant that generates professional emails based on conversation transcripts.`,
    SYSTEM_COACHING_INSIGHTS: `You are an AI sales coach. Analyze sales conversations and provide actionable coaching insights.`,

    // ================================================================
    // TRANSCRIPT ANALYSIS PROMPTS
    // ================================================================

    /**
     * Get transcript analysis prompt
     */
    getTranscriptAnalysisPrompt(transcript, defaultDate) {
        const dateStr = defaultDate || new Date().toISOString().split('T')[0];
        
        return `You are an AI assistant for a CRM system. Analyze the following conversation transcript and extract structured data.

TRANSCRIPT:
"""
${transcript}
"""

Extract the following fields from the transcript. If a field is not mentioned, use "N/A". If the transcript explicitly states a field is unavailable (e.g., "email doesn't work"), mark it as "Unavailable".

Return a JSON object with the following structure:

{
    "business": {
        "value": "Business name",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "contactName": {
        "value": "Contact name",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "role": {
        "value": "Role (Owner, Manager, etc.)",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "phone": {
        "value": "Phone number",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "email": {
        "value": "Email address or 'Unavailable'",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "date": {
        "value": "Date in YYYY-MM-DD format (use ${dateStr} if not mentioned)",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "time": {
        "value": "Time (e.g., '9:00 AM EDT')",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "status": {
        "value": "Meeting Booked | Warm Callback | Personal Callback | Hot Transfer | Completed | Canceled | No Show | Rescheduled | Pending",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "assignedTo": {
        "value": "Name of assigned agent or 'N/A'",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "developerNotes": {
        "value": "Concise summary of key points for developer",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "callSummary": {
        "value": "Brief 2-3 sentence summary of the call",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "meetingQualityScore": {
        "value": 0-10 (based on: Interest, Value, Engagement, Confirmation, Obligation, Discovery),
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "detectedObjections": {
        "value": ["objection1", "objection2"],
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "missingInformation": {
        "value": ["field1", "field2"],
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "suggestedFollowUp": {
        "value": ["action1", "action2"],
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "tags": {
        "value": ["tag1", "tag2"],
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    },
    "sentiment": {
        "value": "Very Positive | Positive | Neutral | Negative | Very Negative",
        "confidence": 0.0-1.0,
        "evidence": "sentence from transcript"
    }
}

Use the following confidence criteria:
- 0.9-1.0: Explicitly stated in the transcript
- 0.7-0.9: Clearly implied but not explicitly stated
- 0.5-0.7: Some evidence but not certain
- 0.0-0.5: Weak or no evidence

Rules:
- For date, use ${dateStr} if not mentioned
- For email, if transcript says "email doesn't work", "email is full", or similar, set to "Unavailable"
- For status, detect from conversation: booked meeting, callback, hot transfer, etc.
- For meetingQualityScore, evaluate based on the conversation

Respond ONLY with valid JSON. No additional text.`;
    },

    /**
     * Get follow-up actions prompt
     */
    getFollowUpActionsPrompt(transcript) {
        return `Based on this conversation transcript, suggest 3-5 follow-up actions:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON array of objects with:
- action: "What to do"
- type: "call|email|meeting|task|note"
- priority: "high|medium|low"
- dueIn: "days"

EXAMPLE:
[
    {"action": "Send meeting invite", "type": "email", "priority": "high", "dueIn": 1},
    {"action": "Prepare website preview", "type": "task", "priority": "high", "dueIn": 2}
]

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get email draft prompt
     */
    getEmailDraftPrompt(transcript, type = 'followup') {
        return `Generate a professional ${type} email based on this conversation:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- subject: "Email subject line"
- body: "Email body content"
- tone: "professional|friendly|formal"

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get call summary prompt
     */
    getCallSummaryPrompt(transcript) {
        return `Generate a concise call summary (2-3 sentences) from this transcript:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- summary: "Brief 2-3 sentence summary"
- keyTopics: ["topic1", "topic2"]
- nextSteps: "What happens next"

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get coaching insights prompt
     */
    getCoachingInsightsPrompt(transcript) {
        return `Analyze this sales conversation and provide coaching insights:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- strengths: ["strength1", "strength2"]
- improvements: ["improvement1", "improvement2"]
- objectionsHandled: ["objection1", "objection2"]
- missedOpportunities: ["opportunity1", "opportunity2"]
- overallRating: 0-10

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get objection analysis prompt
     */
    getObjectionAnalysisPrompt(transcript) {
        return `Identify and analyze objections in this conversation:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- objections: ["objection1", "objection2"]
- handled: ["handled1", "handled2"]
- unhandled: ["unhandled1", "unhandled2"]
- recommendations: ["recommendation1", "recommendation2"]

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get meeting quality score prompt
     */
    getMeetingQualityScorePrompt(transcript) {
        return `Score this meeting based on the transcript:

TRANSCRIPT:
"""
${transcript}
"""

Rate each metric 0-10:
1. Interest: How interested was the prospect?
2. Value: Was value clearly communicated?
3. Engagement: How engaged was the prospect?
4. Confirmation: Did they confirm next steps?
5. Obligation: Was there a clear obligation created?
6. Discovery: How well were needs discovered?

Return a JSON object with:
- interest: 0-10
- value: 0-10
- engagement: 0-10
- confirmation: 0-10
- obligation: 0-10
- discovery: 0-10
- overall: 0-10 (average)
- recommendation: "High quality meeting | Good meeting | Needs improvement | Poor meeting"

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get sentiment analysis prompt
     */
    getSentimentAnalysisPrompt(transcript) {
        return `Analyze the sentiment in this conversation:

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- overall: "Very Positive | Positive | Neutral | Negative | Very Negative"
- prospect: "Very Positive | Positive | Neutral | Negative | Very Negative"
- confidence: 0.0-1.0
- keyPhrases: ["phrase1", "phrase2"]

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get next steps prompt
     */
    getNextStepsPrompt(transcript) {
        return `Based on this conversation, what are the next steps?

TRANSCRIPT:
"""
${transcript}
"""

Return a JSON object with:
- immediate: ["action1", "action2"]
- shortTerm: ["action1", "action2"]
- longTerm: ["action1", "action2"]
- timeline: "Description of timeline"

Return ONLY valid JSON. No additional text.`;
    },

    /**
     * Get prompt for specific use case
     */
    getPromptForUseCase(useCase, params = {}) {
        const promptMap = {
            'transcript_analysis': this.getTranscriptAnalysisPrompt,
            'follow_up': this.getFollowUpActionsPrompt,
            'email_followup': this.getEmailDraftPrompt,
            'call_summary': this.getCallSummaryPrompt,
            'coaching': this.getCoachingInsightsPrompt,
            'objections': this.getObjectionAnalysisPrompt,
            'quality_score': this.getMeetingQualityScorePrompt,
            'sentiment': this.getSentimentAnalysisPrompt,
            'next_steps': this.getNextStepsPrompt
        };

        const promptFn = promptMap[useCase];
        if (!promptFn) {
            console.warn(`No prompt found for use case: ${useCase}`);
            return null;
        }

        if (params.transcript) {
            return promptFn(params.transcript, params.defaultDate);
        }
        return null;
    }
};

// ================================================================
// EXPOSE GLOBALLY
// ================================================================

window.AIPrompts = AIPrompts;

console.log('📝 AI Prompts module loaded');
console.log(`📝 ${Object.keys(AIPrompts).filter(k => typeof AIPrompts[k] === 'function').length} prompt functions available`);