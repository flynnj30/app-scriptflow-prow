export interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  timestamp: string; // e.g. "00:01"
  speaker?: string; // e.g. "Speaker 1" or "Flynn"
  text: string;
  confidence?: number;
}

export interface SummaryData {
  overview: string[];
  keyPoints: string[];
  takeaways: string[];
  actionItems?: string[];
  template?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  color?: string;
  children?: MindMapNode[];
}

export interface BookingInfo {
  businessName: string;
  name: string;
  role: string;
  phoneNumber: string;
  demoTimeDate: string;
  email: string;
  notesForDeveloper: string;
  interestLevel?: 'High' | 'Medium' | 'Low' | 'Not specified';
  // 7-part Formula Elements
  whoIsAttending?: string;
  currentSetup?: string;
  websiteGoal?: string;
  whatToShow?: string;
  interestAndAttitude?: string;
  objectionOrConcern?: string;
  meetingAngle?: string;
}

export interface VideoScene {
  timestamp: string;
  startSec: number;
  endSec: number;
  title: string;
  visualDescription: string;
  keyInsights: string[];
}

export interface VideoAnalysisData {
  videoTitle?: string;
  scenes: VideoScene[];
  visualHighlights: string[];
  screenContentSummary: string;
  speakerActions: string[];
  executiveTakeaways: string[];
  modelUsed?: string;
}

export interface LowLatencyChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  latencyMs?: number;
  modelUsed?: string;
  timestamp: string;
}

export interface TranscriptionOptions {
  language: string;
  enableTranslation: boolean;
  targetLanguage: string;
  generateSubtitles: boolean;
  speakerIdentification: boolean;
  summaryType: 'off' | 'general' | 'detailed' | 'takeaways' | 'action_items';
  intelligenceTier?: 'fast' | 'deep' | 'lite';
  enableVideoAnalysis?: boolean;
}

export interface TranscriptResult {
  fileName: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  durationFormatted: string;
  durationSeconds: number;
  wordCount: number;
  characterCount: number;
  detectedLanguage: string;
  confidenceScore: number;
  processingTimeSeconds: number;
  segments: TranscriptSegment[];
  fullTranscript: string;
  summary?: SummaryData;
  subtitlesSrt?: string;
  subtitlesVtt?: string;
  mindMap?: MindMapNode;
  bookingInfo?: BookingInfo;
  audioBlobUrl?: string;
  audioMimeType?: string;
  isVideo?: boolean;
  videoAnalysis?: VideoAnalysisData;
}

export type AppPhase = 'upload' | 'config' | 'processing' | 'completed';
