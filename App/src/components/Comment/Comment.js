import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Trash, Reply } from '../Icons/Icons';
import CommentComposer from './CommentComposer';
import './Comment.css';

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

  return (
    <div
      className={[
        'comment-node',
        depth > 0 ? 'comment-node--reply' : '',
        depth >= MAX_VISUAL_DEPTH ? 'comment-node--capped' : '',
      ].join(' ')}
      style={{ '--depth': visualDepth }}
    >
      <article
        className={['comment', pending ? 'is-pending' : ''].join(' ')}
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
            <div className="comment__actions">
              <button
                type="button"
                className="comment__action"
                onClick={() => setIsReplying((v) => !v)}
                aria-expanded={isReplying}
              >
                <Reply size={13} />
                <span>{isReplying ? 'Cancel' : 'Reply'}</span>
              </button>
              {isOwn && onDelete && (
                <>
                  <span className="comment__action-dot" aria-hidden="true">·</span>
                  <button
                    type="button"
                    className="comment__action comment__action--danger"
                    onClick={() => onDelete(_id)}
                  >
                    <Trash size={13} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
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
              key={child._id}
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
