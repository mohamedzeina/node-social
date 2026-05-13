import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Image from '../../Image/Image';
import './Post.css';

const Post = props => {
  const [liked, setLiked] = useState(false);
  const initial = (props.author || '').trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="post">
      <header className="post__header">
        <div className="post__avatar" aria-hidden="true">{initial}</div>
        <div className="post__byline">
          <span className="post__author">{props.author}</span>
          <span className="post__date">{props.date}</span>
        </div>
        <div className="post__menu">
          <button
            className="post__menu-btn"
            onClick={props.onStartEdit}
            aria-label="Edit"
            title="Edit"
          >
            ✎
          </button>
          <button
            className="post__menu-btn post__menu-btn--danger"
            onClick={props.onDelete}
            aria-label="Delete"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </header>

      <Link to={'/' + props.id} className="post__body">
        <h2 className="post__title">{props.title}</h2>
        <p className="post__content">{props.content}</p>
      </Link>

      {props.image && (
        <Link to={'/' + props.id} className="post__image">
          <Image imageUrl={props.image} />
        </Link>
      )}

      <footer className="post__footer">
        <button
          className={['post__action', 'post__action--like', liked ? 'is-liked' : ''].join(' ')}
          onClick={() => setLiked(v => !v)}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <span className="post__action-icon" aria-hidden="true">
            {liked ? '♥' : '♡'}
          </span>
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <Link to={'/' + props.id} className="post__action">
          <span className="post__action-icon" aria-hidden="true">💬</span>
          <span>Reply</span>
        </Link>

        <button
          className="post__action"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: props.title, url: window.location.origin + '/' + props.id }).catch(() => {});
            }
          }}
          aria-label="Share"
        >
          <span className="post__action-icon" aria-hidden="true">↗</span>
          <span>Share</span>
        </button>
      </footer>
    </article>
  );
};

export default Post;
