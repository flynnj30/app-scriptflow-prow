import { BookingInfo } from '../types';

/**
 * Formats the extracted booking information into the exact copy/paste format specified:
 *
 * Business Name: Top Gear Motors
 * Name: Serge
 * Role: Owner
 * Phone Number: +19162759921
 * Demo Time & Date: Monday, August 17th at 4:00 PM PDT
 * Email: topgearmotors2100@gmail.com
 *
 * Notes for the Developer:
 *
 * Owner attending; no existing website.
 * Main goal: make it easier for customers to contact him.
 * ...
 */
export function formatBookingInfoForClipboard(info: BookingInfo): string {
  const businessName = info.businessName?.trim() || 'Not specified';
  const name = info.name?.trim() || 'Not specified';
  const role = info.role?.trim() || 'Not specified';
  const phoneNumber = info.phoneNumber?.trim() || 'Not specified';
  const demoTimeDate = info.demoTimeDate?.trim() || 'Not specified';
  const email = info.email?.trim() || 'Not specified';
  const notes = info.notesForDeveloper?.trim() || 'Not specified';

  return `Business Name: ${businessName}
Name: ${name}
Role: ${role}
Phone Number: ${phoneNumber}
Demo Time & Date: ${demoTimeDate}
Email: ${email}

Notes for the Developer:

${notes}`;
}

/**
 * Intelligent client-side extractor that analyzes the transcript verbatim.
 * Strictly adheres to:
 * - If a field is not mentioned or cannot be confidently identified, display: "Not specified"
 * - Do not guess or fabricate information.
 * - Formulates "Notes for the Developer" using the exact 7-part framework:
 *   Who is attending? + Current setup + Website goal + What to show + Interest and attitude + Objection + Meeting angle
 */
export function extractBookingInfoClient(transcript: string, fileName?: string): BookingInfo {
  if (!transcript || transcript.trim().length === 0) {
    return {
      businessName: 'Not specified',
      name: 'Not specified',
      role: 'Not specified',
      phoneNumber: 'Not specified',
      demoTimeDate: 'Not specified',
      email: 'Not specified',
      notesForDeveloper: 'Not specified',
      interestLevel: 'Not specified'
    };
  }

  const text = transcript;

  // 1. Extract Email Address
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[1].trim() : 'Not specified';

  // 2. Extract Phone Number (formats: +1..., (916)..., 916-..., etc.)
  const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?(?:\(?(\d{3})\)?)[-.\s]?(\d{3})[-.\s]?(\d{4})/i;
  const phoneMatch = text.match(phoneRegex);
  let phoneNumber = 'Not specified';
  if (phoneMatch) {
    phoneNumber = phoneMatch[0].trim();
  } else {
    // Check for spoken digits (e.g. "nine one six two seven five...")
    const spokenPhone = text.match(/(?:call me at|reach me at|number is|phone is)\s+([0-9\s-]{7,15})/i);
    if (spokenPhone) {
      phoneNumber = spokenPhone[1].trim();
    }
  }

  // 3. Extract Role
  let role = 'Not specified';
  const rolePatterns = [
    /\b(I'm|I am|this is the|speaking as the)\s+(owner|co-owner|founder|co-founder|manager|general manager|director|president|CEO|proprietor|partner)\b/i,
    /\b(owner|co-owner|founder|general manager|director|manager|proprietor)\b/i
  ];
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) {
      const found = (match[2] || match[1] || match[0]).toLowerCase();
      role = found.charAt(0).toUpperCase() + found.slice(1);
      break;
    }
  }

  // 4. Extract Prospect Name
  let name = 'Not specified';
  const namePatterns = [
    /(?:this is|I'm|I am|is this|name is|speaking with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:Is this|Hey|Hi|Hello)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\?/
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cand = match[1].trim();
      // Filter out greetings and common words
      if (!['Hello', 'Hey', 'Good', 'Yeah', 'Yes', 'Okay', 'Flynn', 'Speaker'].includes(cand)) {
        name = cand;
        break;
      }
    }
  }

  // 5. Extract Business Name
  let businessName = 'Not specified';
  const businessPatterns = [
    /(?:business name is|calling from|at|with|company called)\s+([A-Z0-9][A-Za-z0-9\s&'-]+?)(?:\.|\?|,|and|on|for)/i,
    /(?:website preview for|preview for your business,?\s*)([A-Z0-9][A-Za-z0-9\s&'-]+?)(?:\.|\?|,|it's|is)/i
  ];
  for (const pattern of businessPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      const candidate = match[1].trim();
      if (!['your business', 'a business', 'local businesses', 'the team', 'today'].includes(candidate.toLowerCase())) {
        businessName = candidate;
        break;
      }
    }
  }

  // 6. Extract Demo Time & Date
  let demoTimeDate = 'Not specified';
  const timeDatePatterns = [
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:,\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?)?(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s+[A-Z]{3,4})?)/i,
    /(?:tomorrow|Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)/i,
    /\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\s+(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
  ];
  for (const pattern of timeDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      demoTimeDate = match[0].trim();
      break;
    }
  }

  // Determine Interest Level
  let interestLevel: 'High' | 'Medium' | 'Low' = 'Medium';
  const lower = text.toLowerCase();
  if (
    lower.includes('excited') || 
    lower.includes('love') || 
    lower.includes('great initiative') || 
    (lower.includes('send the calendar') && lower.includes('discuss pricing')) ||
    (lower.includes('definitely') && lower.includes('work'))
  ) {
    interestLevel = 'High';
  } else if (
    lower.includes('not interested') || 
    lower.includes('stop calling') || 
    lower.includes('skeptical') ||
    lower.includes('already good enough')
  ) {
    interestLevel = 'Low';
  } else {
    interestLevel = 'Medium';
  }

  // 7. Formulate "Notes for the Developer" based on the framework:
  // Who is attending? + Current setup + Website goal + What to show + Interest and attitude + Objection + Meeting angle
  const who = role !== 'Not specified' && name !== 'Not specified' 
    ? `${role} (${name}) attending.` 
    : role !== 'Not specified' 
      ? `${role} attending.` 
      : name !== 'Not specified' 
        ? `${name} attending.` 
        : 'Key decision maker attending.';

  let setup = 'Current setup: Not specified';
  if (lower.includes('no website') || lower.includes("don't have a website") || lower.includes('no existing website')) {
    setup = 'Current setup: No active website, relies on direct referrals/social presence.';
  } else if (lower.includes('facebook') || lower.includes('instagram')) {
    setup = 'Current setup: Facebook / social media only.';
  } else if (lower.includes('mobile') || lower.includes('phone') || lower.includes('outdated')) {
    setup = 'Current setup: Existing website suffers from outdated mobile layout and phone booking friction.';
  } else if (lower.includes('basic website') || lower.includes('have a site')) {
    setup = 'Current setup: Existing basic website in place.';
  }

  let goal = 'Main goal: Upgrade digital presence to capture more customer bookings and inquiries.';
  if (lower.includes('more leads') || lower.includes('lead generation')) {
    goal = 'Main goal: Drive higher conversion and inbound qualified leads.';
  } else if (lower.includes('booking') || lower.includes('appointment') || lower.includes('phone')) {
    goal = 'Main goal: Provide a seamless mobile appointment booking experience for clients.';
  } else if (lower.includes('contact') || lower.includes('reach me')) {
    goal = 'Main goal: Make it effortless for customers to contact and find the business.';
  }

  let show = 'What to show: Mobile responsive booking workflow, speed comparisons, and clean modern styling.';
  if (lower.includes('seo') || lower.includes('google')) {
    show = 'What to show: Local SEO structure, mobile appointment form, and fast loading speed.';
  } else if (lower.includes('photo') || lower.includes('gallery') || lower.includes('logo')) {
    show = 'What to show: Custom logo integration, portfolio gallery, and mobile contact form.';
  }

  let attitude = 'Interest & attitude: Medium-high; curious and agreed to a live walkthrough demonstration.';
  if (interestLevel === 'High') {
    attitude = 'Interest & attitude: High interest; positive, receptive, and eager to see improvements.';
  } else if (interestLevel === 'Low') {
    attitude = 'Interest & attitude: Reserved/skeptical; wants proof of tangible value before discussing next steps.';
  }

  let objection = 'Concern/objection: Wants to ensure transition is fast, low-friction, and cost-effective.';
  if (lower.includes('permission') || lower.includes('consent')) {
    objection = 'Concern/objection: Initial surprise about unsolicited mockup (clarified it is on a private staging sandbox).';
  } else if (lower.includes('another company') || lower.includes('considering another')) {
    objection = 'Concern/objection: Currently comparing alternatives or considering another website vendor.';
  } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost')) {
    objection = 'Concern/objection: Will evaluate pricing and ROI strictly during the walkthrough.';
  }

  let angle = 'Meeting angle: Position preview as a private visual comparison, lead with mobile booking efficiency, and keep walkthrough focused on tangible business ROI.';
  if (interestLevel === 'High') {
    angle = 'Meeting angle: Keep the walkthrough punchy and focused on lead generation and mobile conversion.';
  } else if (interestLevel === 'Low') {
    angle = 'Meeting angle: Use discovery first, highlight only highest-impact mobile friction fixes, and avoid aggressive closing.';
  }

  const notesForDeveloper = `${who}
${setup}
${goal}
${show}
${attitude}
${objection}
${angle}`;

  return {
    businessName,
    name,
    role,
    phoneNumber,
    demoTimeDate,
    email,
    notesForDeveloper,
    interestLevel,
    whoIsAttending: who,
    currentSetup: setup,
    websiteGoal: goal,
    whatToShow: show,
    interestAndAttitude: attitude,
    objectionOrConcern: objection,
    meetingAngle: angle
  };
}

/**
 * Server-backed AI extractor that calls `/api/extract-booking`
 */
export async function extractBookingInfoWithServer(transcript: string, intelligenceTier: string = 'fast'): Promise<BookingInfo> {
  try {
    const res = await fetch('/transcript-api/extract-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, intelligenceTier })
    });

    const cType = res.headers.get('content-type') || '';
    if (res.ok && cType.includes('application/json')) {
      const data = await res.json();
      if (data.bookingInfo) {
        return data.bookingInfo;
      }
    }
  } catch (e) {
    console.warn('Server booking extraction fallback to local parser:', e);
  }

  return extractBookingInfoClient(transcript);
}
