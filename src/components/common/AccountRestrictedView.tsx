import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Clock, Send, CheckCircle2, XCircle, HelpCircle, FileText, ArrowRight, UserCheck } from 'lucide-react';
import { User, AccountAppeal } from '../../types';
import { storage } from '../../lib/storage';
import { formatDate } from '../../lib/utils';
import { SingleImageUploader } from './SingleImageUploader';

interface AccountRestrictedViewProps {
  user: User;
  onSwitchUser?: (userId: string) => void;
}

export function AccountRestrictedView({ user, onSwitchUser }: AccountRestrictedViewProps) {
  const [subject, setSubject] = useState('');
  const [explanation, setExplanation] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isBanned = user.status === 'banned';
  const isSuspended = user.status === 'suspended';

  const userAppeals = storage.getAppealsByUser(user.id);
  const allUsers = storage.getUsers();

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !explanation.trim()) {
      setErrorMsg('Please enter both a subject and explanation for your appeal.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      storage.submitAppeal({
        userId: user.id,
        subject: subject.trim(),
        explanation: explanation.trim(),
        attachments: attachmentUrl.trim() ? [attachmentUrl.trim()] : undefined,
      });

      setSubject('');
      setExplanation('');
      setAttachmentUrl('');
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Container */}
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Main Status Header Card */}
        <div className="rounded-3xl border border-red-950/80 bg-neutral-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-900/20 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <div className={`p-4 rounded-2xl ${isBanned ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              <ShieldAlert className="h-10 w-10 shrink-0" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full ${isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {isBanned ? 'Account Banned' : 'Account Suspended'}
                </span>
                <span className="text-xs text-neutral-500 font-mono">ID: {user.id}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {isBanned ? 'You have been banned from the platform.' : 'Your account access is temporarily suspended.'}
              </h1>
              <p className="text-sm text-neutral-400">
                Your account privileges and protected workspace access have been revoked by platform administration.
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-800/80 pt-6 text-xs">
            <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
              <p className="text-neutral-500 font-medium">Reason Specified</p>
              <p className="mt-1 font-semibold text-neutral-200">
                {isBanned ? user.banReason || 'Platform policy violation' : user.suspensionReason || 'Account review in progress'}
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
              <p className="text-neutral-500 font-medium">Enforcement Date</p>
              <p className="mt-1 font-semibold text-neutral-200">
                {formatDate(isBanned ? user.bannedAt || user.createdAt : user.suspendedAt || user.createdAt)}
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
              <p className="text-neutral-500 font-medium">Restriction Type</p>
              <p className="mt-1 font-semibold text-neutral-200">
                {isBanned
                  ? user.banType === 'temporary'
                    ? 'Temporary Ban'
                    : 'Permanent Ban'
                  : user.suspensionEndDate
                  ? `Suspended until ${formatDate(user.suspensionEndDate)}`
                  : 'Temporary Suspension'}
              </p>
            </div>
          </div>

          {/* Account Switcher Bar for Demo Testing */}
          {onSwitchUser && (
            <div className="mt-6 pt-4 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-neutral-400">Testing platform governance? Switch account:</span>
              <div className="flex flex-wrap items-center gap-2">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                      u.id === user.id
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    }`}
                  >
                    {u.name.split('(')[0].trim()} ({u.role}) {u.status ? `[${u.status}]` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appeal Section */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" /> Submit an Official Appeal
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              If you believe this action was taken in error or you have resolved the underlying issue, submit a formal appeal to platform administration.
            </p>
          </div>

          {submittedSuccess && (
            <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/80 p-4 text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Appeal Submitted Successfully</p>
                <p className="text-emerald-400/80">Your appeal has been logged and sent to platform administrators for review.</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-red-950/60 border border-red-800/80 p-4 text-xs text-red-300 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitAppeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Appeal Subject / Brief Title</label>
              <input
                type="text"
                placeholder="e.g., Request to review account restriction regarding order fulfillment"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Detailed Explanation & Justification</label>
              <textarea
                rows={4}
                placeholder="Provide complete context, steps taken to resolve any policy violations, or evidence supporting your appeal..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                required
              />
            </div>

            <SingleImageUploader
              value={attachmentUrl}
              onChange={(url) => setAttachmentUrl(url)}
              label="Supporting Document / Proof Attachment (Optional)"
              description="Upload evidence, business license, or identification document directly from your device."
              aspectRatio="auto"
            />

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Appeal to Admin'}
              </button>
            </div>
          </form>

          {/* Previous Appeals History */}
          {userAppeals.length > 0 && (
            <div className="border-t border-neutral-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Submitted Appeals History</h3>
              <div className="space-y-3">
                {userAppeals.map((apl) => (
                  <div key={apl.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{apl.subject}</span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                          apl.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : apl.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : apl.status === 'more_info_requested'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {apl.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-neutral-400 text-xs leading-relaxed">{apl.explanation}</p>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 font-mono">
                      <span>Submitted: {formatDate(apl.createdAt)}</span>
                      {apl.adminNotes && <span className="text-amber-400 font-normal">Admin Note: {apl.adminNotes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
