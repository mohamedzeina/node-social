import React from 'react';
import { Link } from 'react-router-dom';

import { Trash } from '../Icons/Icons';
import './Comment.css';

/**
 * A single comment row.
 *
 * Props:
 * - comment: { _id, content, createdAt, author: {_id, name, avatarUrl} }
 * - isOwn: viewer is the author → show delete affordance
 * - pending: optimistic (not yet confirmed by server)
 * - onDelete(commentId)
 */
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

const Comment = ({ comment, isOwn, pending, onDelete }) => {
  const { _id, content, createdAt, author } = comment;
  const name = (author && author.name) || 'Unknown';
  const avatar = author && author.avatarUrl;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const authorId = author && author._id;

  return (
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

      {isOwn && onDelete && !pending && (
        <button
          type="button"
          className="comment__delete"
          onClick={() => onDelete(_id)}
          aria-label="Delete comment"
          title="Delete"
        >
          <Trash size={15} />
        </button>
      )}
    </article>
  );
};

export default Comment;
