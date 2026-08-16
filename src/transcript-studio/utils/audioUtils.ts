import { TranscriptSegment, MindMapNode, TranscriptResult } from '../types';

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(p => parseFloat(p));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parseFloat(timeStr) || 0;
}

export function generateSrt(segments: TranscriptSegment[]): string {
  return segments.map((seg, idx) => {
    const start = formatSrtTime(seg.startSec);
    const end = formatSrtTime(seg.endSec);
    const speakerPrefix = seg.speaker ? `[${seg.speaker}] ` : '';
    return `${idx + 1}\n${start} --> ${end}\n${speakerPrefix}${seg.text}\n`;
  }).join('\n');
}

export function generateVtt(segments: TranscriptSegment[]): string {
  let vtt = 'WEBVTT - OPUS Audio Transcript\n\n';
  segments.forEach((seg, idx) => {
    const start = formatVttTime(seg.startSec);
    const end = formatVttTime(seg.endSec);
    const speakerPrefix = seg.speaker ? `<v ${seg.speaker}>` : '';
    vtt += `${idx + 1}\n${start} --> ${end}\n${speakerPrefix}${seg.text}\n\n`;
  });
  return vtt;
}

export function formatSrtTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function formatVttTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const ms = Math.floor((safeSec % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function generateTxt(result: TranscriptResult): string {
  if (result.segments && result.segments.length > 0) {
    return result.segments.map(s => {
      const speaker = s.speaker ? `[${s.speaker}] ` : '';
      return `[${s.timestamp}] ${speaker}${s.text}`;
    }).join('\n\n');
  }
  return result.fullTranscript || '';
}

export function generateJsonExport(result: TranscriptResult): string {
  const exportPayload = {
    metadata: {
      fileName: result.fileName,
      fileSize: result.fileSizeFormatted,
      fileSizeBytes: result.fileSizeBytes,
      duration: result.durationFormatted,
      durationSeconds: result.durationSeconds,
      wordCount: result.wordCount,
      characterCount: result.characterCount,
      detectedLanguage: result.detectedLanguage,
      confidenceScore: result.confidenceScore,
      exportedAt: new Date().toISOString()
    },
    fullTranscript: result.fullTranscript,
    segments: result.segments.map(s => ({
      id: s.id,
      startSec: s.startSec,
      endSec: s.endSec,
      timestamp: s.timestamp,
      speaker: s.speaker || 'Speaker 1',
      text: s.text,
      confidence: s.confidence ?? 0.98
    })),
    bookingInfo: result.bookingInfo || null,
    summary: result.summary || null,
    mindMap: result.mindMap || null,
    videoAnalysis: result.videoAnalysis || null
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function downloadExportFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateMarkdown(fileName: string, segments: TranscriptSegment[], duration: string): string {
  let md = `# Transcription: ${fileName}\n\n`;
  md += `**Duration:** ${duration}  \n`;
  md += `**Date Transcribed:** ${new Date().toLocaleDateString()}  \n\n`;
  md += `## Transcript\n\n`;
  
  segments.forEach(seg => {
    const speaker = seg.speaker ? `**${seg.speaker}** ` : '';
    md += `> **[${seg.timestamp}]** ${speaker}\n${seg.text}\n\n`;
  });

  return md;
}

export function buildDefaultMindMap(fileName: string, segments: TranscriptSegment[]): MindMapNode {
  return {
    id: 'root',
    label: fileName.replace(/\.[^/.]+$/, ''),
    type: 'root',
    color: '#6366f1',
    children: [
      {
        id: 'overview-node',
        label: 'Discussion Overview',
        type: 'branch',
        color: '#38bdf8',
        children: [
          { id: 'c1', label: 'Initial greeting & outreach', type: 'leaf' },
          { id: 'c2', label: 'Website preview discussion', type: 'leaf' }
        ]
      },
      {
        id: 'key-points-node',
        label: 'Key Points',
        type: 'branch',
        color: '#ec4899',
        children: [
          { id: 'k1', label: 'Custom website mockup built', type: 'leaf' },
          { id: 'k2', label: 'Permission & consent clarification', type: 'leaf' },
          { id: 'k3', label: 'Local business outreach program', type: 'leaf' }
        ]
      },
      {
        id: 'action-items-node',
        label: 'Next Steps / Action Items',
        type: 'branch',
        color: '#10b981',
        children: [
          { id: 'a1', label: 'Follow up call on Friday', type: 'leaf' },
          { id: 'a2', label: 'Share live preview link', type: 'leaf' }
        ]
      }
    ]
  };
}

/**
 * Creates a synthetic silent or tone audio buffer for playback when no real file audio element is directly streamable
 */
export function createSyntheticAudioBlob(durationSeconds: number = 60): string {
  try {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * Math.min(durationSeconds, 300));
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV Header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 for Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate gentle pleasant human voice frequency pattern tones
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech-like formant frequency variations
      const modulation = Math.sin(2 * Math.PI * 2 * t);
      const carrier = Math.sin(2 * Math.PI * (220 + 30 * modulation) * t);
      const envelope = Math.max(0, Math.sin(2 * Math.PI * 0.5 * t));
      const sample = carrier * envelope * 0.15;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Could not generate synthetic audio blob', e);
    return '';
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
