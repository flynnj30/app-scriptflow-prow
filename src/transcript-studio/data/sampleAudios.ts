import { TranscriptResult } from '../types';
import { buildDefaultMindMap } from '../utils/audioUtils';

export interface SampleAudioItem {
  id: string;
  name: string;
  durationFormatted: string;
  durationSeconds: number;
  sizeFormatted: string;
  sizeBytes: number;
  description: string;
  category: string;
  result: TranscriptResult;
}

export const SAMPLE_AUDIOS: SampleAudioItem[] = [
  {
    id: 'aldis-clean',
    name: 'Aldis Clean.opus',
    durationFormatted: '06:54',
    durationSeconds: 414,
    sizeFormatted: '1.79 MB',
    sizeBytes: 1876951,
    description: 'Outreach cold call & business website preview pitch with Aldis Glyn',
    category: 'Sales Call',
    result: {
      fileName: 'Aldis Clean.opus',
      fileSizeFormatted: '1.79 MB',
      fileSizeBytes: 1876951,
      durationFormatted: '06:54',
      durationSeconds: 414,
      wordCount: 1420,
      characterCount: 7850,
      detectedLanguage: 'English (US)',
      confidenceScore: 0.985,
      processingTimeSeconds: 3.4,
      segments: [
        {
          id: 'seg-1',
          startSec: 1,
          endSec: 39,
          timestamp: '00:01',
          speaker: 'Flynn (Host)',
          text: "Hello. Is this Aldis Glyn? Yeah, Aldis Glyn. How may I help you, sir? Okay. Flynn here. I'm actually calling because I found you guys online and would like to share to you that my team actually created a custom website preview for your business. It's already done. I was just wondering if you have a few moments tomorrow or say Friday to quickly look at it and share your thoughts.",
          confidence: 0.99
        },
        {
          id: 'seg-2',
          startSec: 41,
          endSec: 92,
          timestamp: '00:41',
          speaker: 'Aldis Glyn (Prospect)',
          text: "You build a website for me without my permission? What was that, sorry? Okay, you built a website for me without my consent. Basically we are doing this for local businesses, a hundred local businesses every day, and since you're one on our list as well, so we created one for you. If you love it, you can keep it, if not, you know, no hard feelings.",
          confidence: 0.97
        },
        {
          id: 'seg-3',
          startSec: 94,
          endSec: 156,
          timestamp: '01:34',
          speaker: 'Flynn (Host)',
          text: "I completely understand your surprise, Aldis! We don't publish anything live on the internet—it's strictly a private mockup sandbox on our staging server. We noticed your current site hadn't been updated for mobile screens, so our design team wanted to demonstrate tangible value upfront before asking for a penny or commitment.",
          confidence: 0.98
        },
        {
          id: 'seg-4',
          startSec: 158,
          endSec: 215,
          timestamp: '02:38',
          speaker: 'Aldis Glyn (Prospect)',
          text: "Alright, well I appreciate the initiative. We have been getting complaints about booking appointments on phones lately. What would this look like if we wanted to review it together?",
          confidence: 0.98
        },
        {
          id: 'seg-5',
          startSec: 217,
          endSec: 280,
          timestamp: '03:37',
          speaker: 'Flynn (Host)',
          text: "It only takes about 5 to 7 minutes over a screen share. I can show you the live mobile booking flow and the localized SEO structure we configured. Would Friday at 10:00 AM work, or does the afternoon suit your schedule better?",
          confidence: 0.99
        },
        {
          id: 'seg-6',
          startSec: 282,
          endSec: 360,
          timestamp: '04:42',
          speaker: 'Aldis Glyn (Prospect)',
          text: "Friday at 10:30 AM works. Send the calendar invitation to my direct email on our contact page. If the mobile checkout is as smooth as you say, we can discuss pricing then.",
          confidence: 0.97
        },
        {
          id: 'seg-7',
          startSec: 362,
          endSec: 414,
          timestamp: '06:02',
          speaker: 'Flynn (Host)',
          text: "Fantastic, Aldis! I just sent the invite with the private staging access credentials. Have a wonderful rest of your week, and I look forward to speaking with you on Friday.",
          confidence: 0.99
        }
      ],
      fullTranscript: `Flynn (Host): Hello. Is this Aldis Glyn? Yeah, Aldis Glyn. How may I help you, sir? Okay. Flynn here. I'm actually calling because I found you guys online and would like to share to you that my team actually created a custom website preview for your business. It's already done. I was just wondering if you have a few moments tomorrow or say Friday to quickly look at it and share your thoughts.\n\nAldis Glyn (Prospect): You build a website for me without my permission? What was that, sorry? Okay, you built a website for me without my consent. Basically we are doing this for local businesses, a hundred local businesses every day, and since you're one on our list as well, so we created one for you. If you love it, you can keep it, if not, you know, no hard feelings.\n\nFlynn (Host): I completely understand your surprise, Aldis! We don't publish anything live on the internet—it's strictly a private mockup sandbox on our staging server. We noticed your current site hadn't been updated for mobile screens, so our design team wanted to demonstrate tangible value upfront before asking for a penny or commitment.\n\nAldis Glyn (Prospect): Alright, well I appreciate the initiative. We have been getting complaints about booking appointments on phones lately. What would this look like if we wanted to review it together?\n\nFlynn (Host): It only takes about 5 to 7 minutes over a screen share. I can show you the live mobile booking flow and the localized SEO structure we configured. Would Friday at 10:00 AM work, or does the afternoon suit your schedule better?\n\nAldis Glyn (Prospect): Friday at 10:30 AM works. Send the calendar invitation to my direct email on our contact page. If the mobile checkout is as smooth as you say, we can discuss pricing then.\n\nFlynn (Host): Fantastic, Aldis! I just sent the invite with the private staging access credentials. Have a wonderful rest of your week, and I look forward to speaking with you on Friday.`,
      bookingInfo: {
        businessName: 'Aldis Glyn',
        name: 'Aldis Glyn',
        role: 'Owner',
        phoneNumber: 'Not specified',
        demoTimeDate: 'Friday at 10:30 AM',
        email: 'Direct email on contact page',
        interestLevel: 'High',
        notesForDeveloper: `Owner attending (Aldis Glyn); existing website with reported customer booking friction on mobile screens.
Main goal: resolve customer complaints regarding smartphone appointment bookings and streamline checkout.
What to show: live mobile booking flow, smartphone responsiveness, and localized SEO structure.
Interest & attitude: High interest; initially surprised by unsolicited mockup but receptive after learning it is on a private staging sandbox; agreed to a 7-minute screen share.
Concern: Confirmed he will evaluate pricing and checkout smoothness during the walkthrough before committing.
Meeting angle: Keep walkthrough concise (5-7 minutes), demonstrate the instant mobile booking flow directly, and highlight how easily customers can book on mobile.`
      },
      summary: {
        template: 'general',
        overview: [
          'Flynn contacted business owner Aldis Glyn regarding an unsolicited, complimentary mobile website preview built specifically for his business.',
          'Initial hesitation regarding permissions was handled professionally, highlighting that the preview is private and addresses existing mobile booking shortcomings.',
          'The call concluded successfully with a scheduled live walkthrough demonstration on Friday at 10:30 AM.'
        ],
        keyPoints: [
          'Flynn demonstrated proactive customer discovery by diagnosing mobile responsiveness issues on Aldis’s live site.',
          'Aldis acknowledged ongoing customer complaints regarding their current appointment booking UX on smartphone devices.',
          'No financial commitment or contract was requested prior to the scheduled 7-minute demonstration.'
        ],
        takeaways: [
          'Value-first outreach converts cold skepticism into scheduled discovery calls when addressing verified pain points.',
          'Private staging previews remove customer fear of unauthorized brand exposure.',
          'Next action: Calendar invitation sent for Friday 10:30 AM with private preview URL.'
        ],
        actionItems: [
          'Send calendar invitation with screen-share link for Friday at 10:30 AM',
          'Prepare mobile booking flow and local SEO comparison deck for the walkthrough',
          'Have flexible pricing tier sheet ready if requested during demonstration'
        ]
      },
      mindMap: buildDefaultMindMap('Aldis Clean.opus', [])
    }
  },
  {
    id: 'product-sync',
    name: 'Top_Gear_Motors_Outreach.opus',
    durationFormatted: '05:12',
    durationSeconds: 312,
    sizeFormatted: '1.45 MB',
    sizeBytes: 1520435,
    description: 'Discovery consultation & demo appointment booking with Serge from Top Gear Motors',
    category: 'Sales Call',
    result: {
      fileName: 'Top_Gear_Motors_Outreach.opus',
      fileSizeFormatted: '1.45 MB',
      fileSizeBytes: 1520435,
      durationFormatted: '05:12',
      durationSeconds: 312,
      wordCount: 1120,
      characterCount: 6200,
      detectedLanguage: 'English (US)',
      confidenceScore: 0.99,
      processingTimeSeconds: 2.9,
      segments: [
        {
          id: 'tg-1',
          startSec: 0,
          endSec: 35,
          timestamp: '00:00',
          speaker: 'Representative',
          text: "Hi Serge! Calling from the local digital solutions team. I noticed Top Gear Motors has great customer reviews and referral business, but we couldn't find an official modern mobile website when searching for your garage in the area.",
          confidence: 0.99
        },
        {
          id: 'tg-2',
          startSec: 36,
          endSec: 85,
          timestamp: '00:36',
          speaker: 'Serge (Owner)',
          text: "Yeah, this is Serge, owner here. We don't have a website right now—mostly word of mouth and our Facebook page. I've actually looked at quotes from another website provider, but haven't pulled the trigger yet.",
          confidence: 0.98
        },
        {
          id: 'tg-3',
          startSec: 86,
          endSec: 145,
          timestamp: '01:26',
          speaker: 'Representative',
          text: "That's completely understandable. We actually put together a live interactive mockup featuring your logo, service list, and an easy 1-click quote request form so customers can reach you immediately from their phones. You can reach me directly or we can do a quick 5-minute Zoom to compare.",
          confidence: 0.99
        },
        {
          id: 'tg-4',
          startSec: 146,
          endSec: 210,
          timestamp: '02:26',
          speaker: 'Serge (Owner)',
          text: "Sure, I'm open to seeing how it looks compared to the other one. You can call or text my cell at +19162759921, and shoot the Zoom link over to topgearmotors2100@gmail.com. Monday, August 17th at 4:00 PM PDT works for me.",
          confidence: 0.99
        }
      ],
      fullTranscript: `Representative: Hi Serge! Calling from the local digital solutions team. I noticed Top Gear Motors has great customer reviews and referral business, but we couldn't find an official modern mobile website when searching for your garage in the area.\n\nSerge (Owner): Yeah, this is Serge, owner here. We don't have a website right now—mostly word of mouth and our Facebook page. I've actually looked at quotes from another website provider, but haven't pulled the trigger yet.\n\nRepresentative: That's completely understandable. We actually put together a live interactive mockup featuring your logo, service list, and an easy 1-click quote request form so customers can reach you immediately from their phones. You can reach me directly or we can do a quick 5-minute Zoom to compare.\n\nSerge (Owner): Sure, I'm open to seeing how it looks compared to the other one. You can call or text my cell at +19162759921, and shoot the Zoom link over to topgearmotors2100@gmail.com. Monday, August 17th at 4:00 PM PDT works for me.`,
      bookingInfo: {
        businessName: 'Top Gear Motors',
        name: 'Serge',
        role: 'Owner',
        phoneNumber: '+19162759921',
        demoTimeDate: 'Monday, August 17th at 4:00 PM PDT',
        email: 'topgearmotors2100@gmail.com',
        interestLevel: 'High',
        notesForDeveloper: `Owner attending (Serge); no existing website, strong reviews and referral business.
Main goal: make it easier for customers to contact him and request service quotes from phones.
Has a logo and can provide photos/content.
Has reviewed samples from other companies and is considering another provider, but has not committed.
Interest: Medium-high; agreed to the Zoom walkthrough and is open to comparing the preview.
Concern: Already considering another website provider.
Meeting angle: Position the preview as a comparison, highlight contact/lead-generation features, and show how the design/content can be customized using his logo and photos.`
      },
      summary: {
        template: 'general',
        overview: [
          'Serge, owner of Top Gear Motors, confirmed they currently operate without a formal website.',
          'He has reviewed quotes from an alternative provider but is open to evaluating a custom staging preview.',
          'Demo walkthrough scheduled for Monday, August 17th at 4:00 PM PDT.'
        ],
        keyPoints: [
          'Contact info and direct cell (+19162759921) verified.',
          'Zoom calendar invite to be dispatched to topgearmotors2100@gmail.com.',
          'Lead-generation quote form is the primary conversion feature to demonstrate.'
        ],
        takeaways: [
          'Competitive positioning and speed to market are the key decision criteria.'
        ],
        actionItems: [
          'Send Zoom calendar invite for Monday, August 17th at 4:00 PM PDT',
          'Embed Top Gear Motors logo and vehicle service list on staging sandbox'
        ]
      },
      mindMap: buildDefaultMindMap('Top_Gear_Motors_Outreach.opus', [])
    }
  }
];
