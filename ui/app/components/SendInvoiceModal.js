'use client';

import { useEffect, useState } from 'react';

export default function SendInvoiceModal({
  open,
  onClose,
  initialTo = '',
  initialSubject = '',
  initialText = '',
  onSubmit,
}) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [text, setText] = useState(initialText);
  const [sending, setSending] = useState(false);

  // Reset form every time modal opens (so it reflects latest invoice)
  useEffect(() => {
    if (!open) return;
    setTo(initialTo);
    setSubject(initialSubject);
    setText(initialText);
  }, [open, initialTo, initialSubject, initialText]);

  const handleSend = async () => {
    try {
      setSending(true);
      await onSubmit({ to, subject, text });
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Send invoice</h3>

        <div className="mt-4 flex flex-col gap-3">
          <label className="form-control w-full">
            <div className="label"><span className="label-text">Recipient</span></div>
            <input
              className="input input-bordered w-full"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              disabled={sending}
            />
          </label>

          <label className="form-control w-full">
            <div className="label"><span className="label-text">Subject</span></div>
            <input
              className="input input-bordered w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </label>

          <label className="form-control w-full">
            <div className="label"><span className="label-text">Message</span></div>
            <textarea
              className="textarea textarea-bordered w-full min-h-[160px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
            />
          </label>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending || !to}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={() => !sending && onClose()} />
    </div>
  );
}
