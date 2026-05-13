import React, { useRef, useState, useEffect } from 'react';

import './CommentComposer.css';

const MAX = 2000;

const CommentComposer = ({ currentUser, onSubmit }) => {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const taRef = useRef(null);

  // Auto-resize the textarea as the user types
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 220)}px`;
  }, [value]);

  const trimmed = value.trim();
  const disabled = submitting || trimmed.length === 0 || trimmed.length > MAX;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue('');
    } catch (err) {
      // Parent surfaces the error via ErrorHandler; keep the text so
      // the user doesn't lose it.
      console.error('addComment failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Cmd/Ctrl+Enter to submit
  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const initial = ((currentUser && currentUser.name) || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
  const avatar = currentUser && currentUser.avatarUrl;
  const overLimit = trimmed.length > MAX;
  const closeToLimit = trimmed.length > MAX - 100;

  return (
    <form className="comment-composer" onSubmit={handleSubmit}>
      <span className="comment-composer__avatar" aria-hidden="true">
        {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
      </span>

      <div className="comment-composer__body">
        <textarea
          ref={taRef}
          className="comment-composer__textarea"
          placeholder="Write a comment…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          maxLength={MAX + 200}    // generous buffer; we enforce MAX in submit
          rows={1}
          aria-label="Write a comment"
        />

        <div className="comment-composer__footer">
          <span
            className={[
              'comment-composer__counter',
              overLimit ? 'is-over' : '',
              closeToLimit && !overLimit ? 'is-warn' : '',
            ].join(' ')}
            aria-live="polite"
          >
            {trimmed.length > 0 ? `${trimmed.length} / ${MAX}` : ''}
          </span>
          <button
            type="submit"
            className="comment-composer__submit"
            disabled={disabled}
          >
            {submitting ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
