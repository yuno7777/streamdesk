'use client';

import React, { useState } from 'react';

export interface Note {
  id: number;
  note_text: string;
  created_at: string;
}

interface NotesFeedProps {
  notes: Note[];
  customerName: string;
  onAddNote: (noteText: string) => Promise<void>;
}

export default function NotesFeed({ notes, customerName, onAddNote }: NotesFeedProps) {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddNote(noteText.trim());
      setNoteText('');
    } catch (err) {
      console.error('Failed to submit note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCannedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    const firstName = customerName.split(' ')[0];
    if (val === 'greet') {
      setNoteText(`Hi ${firstName}, thank you for reaching out to StreamDesk Support. I would be happy to assist you with this issue.`);
    } else if (val === 'logs') {
      setNoteText(`Hi ${firstName}, could you please provide any relevant system error logs or screenshots so we can analyze the issue further?`);
    } else if (val === 'resolve') {
      setNoteText(`Hi ${firstName}, we have successfully resolved the reported problem. Please let us know if you require any further assistance! Have a great day.`);
    }
    
    e.target.value = ''; // Reset select
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const firstName = customerName.split(' ')[0];

    // Auto-replace shortcuts
    if (text.endsWith('/greet')) {
      setNoteText(text.replace(/\/greet$/, `Hi ${firstName}, thank you for reaching out to StreamDesk Support. I would be happy to assist you with this issue.`));
    } else if (text.endsWith('/logs')) {
      setNoteText(text.replace(/\/logs$/, `Hi ${firstName}, could you please provide any relevant system error logs or screenshots so we can analyze the issue further?`));
    } else if (text.endsWith('/resolve')) {
      setNoteText(text.replace(/\/resolve$/, `Hi ${firstName}, we have successfully resolved the reported problem. Please let us know if you require any further assistance! Have a great day.`));
    } else {
      setNoteText(text);
    }
  };

  return (
    <div className="flex flex-col bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm h-full hover:border-[#CBD5E1] transition-all-150">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Activity & Notes</h3>
      </div>

      {/* Feed Container */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[380px]">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] text-xs font-semibold">
            No activity notes recorded yet.
          </div>
        ) : (
          <div className="relative border-l border-[#E2E8F0] ml-2 space-y-6">
            {notes.map((note) => (
              <div key={note.id} className="relative pl-6">
                {/* Timeline Connector Dot */}
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2563EB] border-2 border-white"></div>
                
                <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-4">
                  <p className="text-xs font-medium text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                    {note.note_text}
                  </p>
                  <div className="mt-2.5 text-[10px] text-[#94A3B8] font-bold">
                    {new Date(note.created_at).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Editor */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8F9FA] rounded-b-xl space-y-3">
        {/* Canned Responses dropdown */}
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="canned-select" className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Quick Snippet
          </label>
          <select
            id="canned-select"
            onChange={handleCannedSelect}
            className="text-[10px] font-semibold bg-white border border-[#E2E8F0] px-2 py-1 rounded-md text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
          >
            <option value="">Insert snippet...</option>
            <option value="greet">/greet - Welcome Greeting</option>
            <option value="logs">/logs - Request Logs</option>
            <option value="resolve">/resolve - Resolution Complete</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="note-input" className="sr-only">Add a note</label>
            <textarea
              id="note-input"
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#94A3B8] text-[#0F172A] resize-none"
              placeholder="Add internal progress note... Try typing /greet or /resolve for quick templates!"
              value={noteText}
              onChange={handleTextChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !noteText.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all-150 shadow-sm border-0 cursor-pointer"
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
