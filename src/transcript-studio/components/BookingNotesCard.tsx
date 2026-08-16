import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Briefcase, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Edit2, 
  Save, 
  RotateCw, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { BookingInfo } from '../types';
import { formatBookingInfoForClipboard } from '../utils/bookingExtractor';
import { HelpTooltip } from './HelpTooltip';

interface BookingNotesCardProps {
  bookingInfo: BookingInfo;
  onUpdateBookingInfo: (info: BookingInfo) => void;
  onReExtract?: () => void;
  isReExtracting?: boolean;
}

export const BookingNotesCard: React.FC<BookingNotesCardProps> = ({
  bookingInfo,
  onUpdateBookingInfo,
  onReExtract,
  isReExtracting = false
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<BookingInfo>(bookingInfo);

  // Sync editedInfo when props update
  React.useEffect(() => {
    setEditedInfo(bookingInfo);
  }, [bookingInfo]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (fieldName === 'ALL') {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } else {
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleCopyAll = () => {
    const formatted = formatBookingInfoForClipboard(editedInfo);
    copyToClipboard(formatted, 'ALL');
  };

  const handleSaveEdits = () => {
    onUpdateBookingInfo(editedInfo);
    setIsEditing(false);
  };

  const formattedOutput = formatBookingInfoForClipboard(editedInfo);

  const getInterestBadge = (level?: string) => {
    switch (level) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            High Interest
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Medium Interest
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Low Interest
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Not specified
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-100">
      
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/50 border border-indigo-500/30 p-4 sm:p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Booking Info & Developer Notes
                </h3>
                {getInterestBadge(editedInfo.interestLevel)}
                <HelpTooltip
                  title="7-Part Booking Intelligence"
                  content="Automatically extracts verified prospect details, demo schedules, and high-impact custom context for client follow-ups."
                  side="bottom"
                />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automatically extracted from transcript using 7-part meeting formula
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onReExtract && (
              <button
                onClick={onReExtract}
                disabled={isReExtracting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                title="Re-extract with AI"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReExtracting ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isReExtracting ? 'Extracting...' : 'Re-extract'}</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </>
              )}
            </button>

            {/* Primary 1-Click Copy All Button */}
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Contact Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Business Name */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Business Name
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.businessName, 'businessName')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Business Name"
            >
              {copiedField === 'businessName' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.businessName}
              onChange={(e) => setEditedInfo({ ...editedInfo, businessName: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold truncate ${editedInfo.businessName === 'Not specified' ? 'text-slate-400 italic' : 'text-white'}`}>
              {editedInfo.businessName}
            </p>
          )}
        </div>

        {/* Name */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Prospect Name
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.name, 'name')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Name"
            >
              {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.name}
              onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold truncate ${editedInfo.name === 'Not specified' ? 'text-slate-400 italic' : 'text-white'}`}>
              {editedInfo.name}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Role
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.role, 'role')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Role"
            >
              {copiedField === 'role' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.role}
              onChange={(e) => setEditedInfo({ ...editedInfo, role: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold truncate ${editedInfo.role === 'Not specified' ? 'text-slate-400 italic' : 'text-white'}`}>
              {editedInfo.role}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Phone Number
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.phoneNumber, 'phoneNumber')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Phone Number"
            >
              {copiedField === 'phoneNumber' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.phoneNumber}
              onChange={(e) => setEditedInfo({ ...editedInfo, phoneNumber: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold font-mono truncate ${editedInfo.phoneNumber === 'Not specified' ? 'text-slate-400 italic font-sans' : 'text-emerald-300'}`}>
              {editedInfo.phoneNumber}
            </p>
          )}
        </div>

        {/* Demo Time & Date */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Demo Time & Date
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.demoTimeDate, 'demoTimeDate')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Demo Time & Date"
            >
              {copiedField === 'demoTimeDate' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.demoTimeDate}
              onChange={(e) => setEditedInfo({ ...editedInfo, demoTimeDate: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold truncate ${editedInfo.demoTimeDate === 'Not specified' ? 'text-slate-400 italic' : 'text-indigo-300'}`}>
              {editedInfo.demoTimeDate}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm relative group hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Email
            </span>
            <button
              onClick={() => copyToClipboard(editedInfo.email, 'email')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Email"
            >
              {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedInfo.email}
              onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
              className="w-full bg-slate-900/80 border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p className={`text-sm font-semibold font-mono truncate ${editedInfo.email === 'Not specified' ? 'text-slate-400 italic font-sans' : 'text-cyan-300'}`}>
              {editedInfo.email}
            </p>
          )}
        </div>

      </div>

      {/* Notes for the Developer (7-Part Framework) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">Notes for the Developer</h4>
            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 hidden sm:inline">
              Personalized Meeting Angle
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(editedInfo.notesForDeveloper, 'notes')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {copiedField === 'notes' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Notes</span>
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <textarea
            rows={7}
            value={editedInfo.notesForDeveloper}
            onChange={(e) => setEditedInfo({ ...editedInfo, notesForDeveloper: e.target.value })}
            className="w-full bg-slate-900/90 border border-indigo-500/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed"
          />
        ) : (
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-black/20 p-4 rounded-xl border border-white/5">
            {editedInfo.notesForDeveloper}
          </div>
        )}
      </div>

      {/* Copy/Paste Output Preview Section */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Copy/Paste Submission Format
          </span>
          <span className="text-[11px] text-slate-400">
            Ready for instant CRM or Calendar input
          </span>
        </div>

        <pre className="text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
          {formattedOutput}
        </pre>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied All Formatted Text to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Entire Formatted Booking Information</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
