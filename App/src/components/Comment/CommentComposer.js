import React, { useRef, useState, useEffect } from 'react';

import './CommentComposer.css';

const MAX = 2000;

/**
 * Inline composer for a top-level comment or a reply.
 *
 * Props:
 * - currentUser:    for the leading avatar
 * - onSubmit(text): resolves on success; the composer clears + closes
 * - onCancel:       if provided, a 'Cancel' button is rendered next to Submit
 * - compact:        smaller paddings / font (used for inline replies)
 * - autoFocus:      focus the textarea on mount
 * - placeholder:    override the default placeholder
 * - submitLabel:    override the default 'Comment'
 */
const CommentComposer = ({
  currentUser,
  onSubmit,
  onCancel,
  compact = false,
  autoFocus = false,
  placeholder,
  submitLabel,
}) => {
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

  // Focus on mount when requested
  useEffect(() => {
    if (autoFocus && taRef.current) taRef.current.focus();
  }, [autoFocus]);

  const trimmed = value.trim();
  const disabled = submitting || trimmed.length === 0 || trimmed.length > MAX;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue('');
    } catch (err) {
      console.error('comment submit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
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
    <form
      className={['comment-composer', compact ? 'comment-composer--compact' : ''].join(' ')}
      onSubmit={handleSubmit}
    >
      <span className="comment-composer__avatar" aria-hidden="true">
        {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
      </span>

      <div className="comment-composer__body">
        <textarea
          ref={taRef}
          className="comment-composer__textarea"
          placeholder={placeholder || 'Write a comment…'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          maxLength={MAX + 200}
          rows={1}
          aria-label={placeholder || 'Write a comment'}
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
          <div className="comment-composer__actions">
            {onCancel && (
              <button
                type="button"
                className="comment-composer__cancel"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="comment-composer__submit"
              disabled={disabled}
            >
              {submitting ? 'Posting…' : submitLabel || 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
