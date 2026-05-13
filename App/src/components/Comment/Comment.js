import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Trash, Reply, Close } from '../Icons/Icons';
import CommentComposer from './CommentComposer';
import './Comment.css';

/* Recursively count all descendants of a comment so the delete-confirm
   can warn the user how many replies will be cascade-deleted. */
const countDescendants = (nodes) =>
  (nodes || []).reduce(
    (acc, n) => acc + 1 + countDescendants(n.replies),
    0
  );

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Cap visual indentation so deep threads don't run off the page.
// Replies past this depth keep the thread structure (via the parent
// ref + indent line) but stop adding extra left-margin.
const MAX_VISUAL_DEPTH = 5;

/**
 * A single comment, optionally rendering its replies recursively.
 *
 * Props:
 * - comment: { _id, content, createdAt, author, __pending?, replies? }
 * - depth: integer (root = 0). Used for indentation only.
 * - viewerId: current user id, for isOwn checks
 * - currentUser: for the reply composer avatar
 * - onAddReply(parentId, content): returns Promise; called from the
 *   inline composer on submit
 * - onDelete(commentId)
 */
const Comment = ({
  comment,
  depth = 0,
  viewerId,
  currentUser,
  onAddReply,
  onDelete,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { _id, content, createdAt, author, __pending: pending, replies = [] } = comment;
  const name = (author && author.name) || 'Unknown';
  const avatar = author && author.avatarUrl;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const authorId = author && author._id;
  const isOwn = authorId && viewerId && authorId === viewerId;

  const handleReplySubmit = async (text) => {
    await onAddReply(_id, text);
    setIsReplying(false);
  };

  const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);
  const hasReplies = replies.length > 0;
  const descendantCount = countDescendants(replies);

  // Auto-cancel the delete confirm after the countdown bar finishes, or
  // when the user hits Escape. Duration matches the visible progress bar
  // animation so the user can see time slipping rather than guess at it.
  const CONFIRM_MS = 4000;
  useEffect(() => {
    if (!isConfirmingDelete) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsConfirmingDelete(false);
    };
    const t = setTimeout(() => setIsConfirmingDelete(false), CONFIRM_MS);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isConfirmingDelete]);

  return (
    <div
      className={[
        'comment-node',
        depth > 0 ? 'comment-node--reply' : '',
        depth >= MAX_VISUAL_DEPTH ? 'comment-node--capped' : '',
        hasReplies ? 'comment-node--has-replies' : '',
        isConfirmingDelete ? 'comment-node--arming-delete' : '',
      ].join(' ')}
      style={{ '--depth': visualDepth }}
    >
      <article
        className={[
          'comment',
          pending ? 'is-pending' : '',
          hasReplies ? 'comment--has-replies' : '',
        ].join(' ')}
        aria-busy={pending || undefined}
      >
        {authorId ? (
          <Link
            to={`/u/${authorId}`}
            className="comment__avatar comment__avatar--link"
            aria-label={`View ${name}'s profile`}
          >
            {avatar ? <img src={avatar} alt="" loading="lazy" /> : <span>{initial}</span>}
          </Link>
        ) : (
          <div className="comment__avatar" aria-hidden="true">
            {avatar ? <img src={avatar} alt="" loading="lazy" /> : <span>{initial}</span>}
          </div>
        )}

        <div className="comment__column">
          <div className="comment__bubble">
            <div className="comment__head">
              {authorId ? (
                <Link to={`/u/${authorId}`} className="comment__author">{name}</Link>
              ) : (
                <span className="comment__author">{name}</span>
              )}
              <span className="comment__date" title={createdAt}>
                {formatRelative(createdAt)}
              </span>
            </div>
            <p className="comment__content">{content}</p>
          </div>

          {/* Actions sit BENEATH the bubble — always visible, native-feeling */}
          {!pending && viewerId && (
            <>
              <div className="comment__actions">
                {!isConfirmingDelete && (
                  <button
                    type="button"
                    className="comment__action"
                    onClick={() => setIsReplying((v) => !v)}
                    aria-expanded={isReplying}
                  >
                    <Reply size={13} />
                    <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                  </button>
                )}
                {isOwn && onDelete && !isConfirmingDelete && (
                  <>
                    <span className="comment__action-dot" aria-hidden="true">·</span>
                    <button
                      type="button"
                      className="comment__action comment__action--danger"
                      onClick={() => setIsConfirmingDelete(true)}
                    >
                      <Trash size={13} />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                {isOwn && onDelete && isConfirmingDelete && (
                  <>
                    <button
                      type="button"
                      className="comment__action comment__action--armed"
                      onClick={() => {
                        onDelete(_id);
                        setIsConfirmingDelete(false);
                      }}
                      autoFocus
                      aria-label={
                        descendantCount > 0
                          ? `Confirm delete — removes this comment and ${descendantCount} ${descendantCount === 1 ? 'reply' : 'replies'}`
                          : 'Confirm delete'
                      }
                      style={{ '--countdown-duration': `${CONFIRM_MS}ms` }}
                    >
                      <Trash size={13} />
                      <span>Click to confirm</span>
                    </button>
                    <button
                      type="button"
                      className="comment__action comment__action--armed-cancel"
                      onClick={() => setIsConfirmingDelete(false)}
                      aria-label="Cancel delete"
                      title="Cancel"
                    >
                      <Close size={13} />
                    </button>
                  </>
                )}
              </div>
              {isConfirmingDelete && descendantCount > 0 && (
                <p className="comment__cascade-hint">
                  {descendantCount} {descendantCount === 1 ? 'reply' : 'replies'} will be removed too
                </p>
              )}
            </>
          )}
        </div>
      </article>

      {isReplying && (
        <div className="comment-node__composer">
          <CommentComposer
            compact
            autoFocus
            currentUser={currentUser}
            placeholder={`Reply to ${name}…`}
            submitLabel="Reply"
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="comment-node__children">
          {replies.map((child) => (
            <Comment
              /* clientId is stable across the optimistic → real swap,
                 _id is the fallback for server-fetched comments. */
              key={child.clientId || child._id}
              comment={child}
              depth={depth + 1}
              viewerId={viewerId}
              currentUser={currentUser}
              onAddReply={onAddReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
