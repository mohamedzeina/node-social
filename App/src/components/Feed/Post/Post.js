import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Image from '../../Image/Image';
import './Post.css';

const API_URL = 'https://node-social-zmra.onrender.com/graphql';

const Post = props => {
  const { id, token, likedByMe = false, likeCount = 0 } = props;
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [pending, setPending] = useState(false);

  // Keep local state in sync if parent re-fetches the feed
  useEffect(() => { setLiked(likedByMe); }, [likedByMe]);
  useEffect(() => { setCount(likeCount); }, [likeCount]);

  const toggleLike = async () => {
    if (pending || !token) return;
    const nextLiked = !liked;
    const nextCount = count + (nextLiked ? 1 : -1);

    // Optimistic update
    setLiked(nextLiked);
    setCount(nextCount);
    setPending(true);

    const mutation = nextLiked ? 'likePost' : 'unlikePost';
    const query = {
      query: `mutation L($id: ID!) { ${mutation}(id: $id) { _id likeCount likedByMe } }`,
      variables: { id },
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);
      // Reconcile with server truth
      const fresh = data.data[mutation];
      setLiked(fresh.likedByMe);
      setCount(fresh.likeCount);
    } catch (err) {
      // Revert on failure
      setLiked(!nextLiked);
      setCount(count);
      console.error('Like toggle failed', err);
    } finally {
      setPending(false);
    }
  };

  const initial = (props.author || '').trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="post">
      <header className="post__header">
        <div className="post__avatar" aria-hidden="true">
          {props.authorAvatar ? (
            <img src={props.authorAvatar} alt="" loading="lazy" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="post__byline">
          {props.authorId ? (
            <Link to={`/u/${props.authorId}`} className="post__author">
              {props.author}
            </Link>
          ) : (
            <span className="post__author">{props.author}</span>
          )}
          <span className="post__date">{props.date}</span>
        </div>
        {props.isOwn && (
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
        )}
      </header>

      <Link to={'/p/' + props.id} className="post__body">
        <h2 className="post__title">{props.title}</h2>
        <p className="post__content">{props.content}</p>
      </Link>

      {props.image && (
        <Link to={'/p/' + props.id} className="post__image">
          <Image imageUrl={props.image} />
        </Link>
      )}

      <footer className="post__footer">
        <button
          className={[
            'post__action',
            'post__action--like',
            liked ? 'is-liked' : '',
            pending ? 'is-pending' : '',
          ].join(' ')}
          onClick={toggleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
        >
          <span className="post__action-icon" aria-hidden="true">
            {liked ? '♥' : '♡'}
          </span>
          <span>{count > 0 ? count : 'Like'}</span>
        </button>

        <Link to={'/p/' + props.id} className="post__action">
          <span className="post__action-icon" aria-hidden="true">💬</span>
          <span>Reply</span>
        </Link>

        <button
          className="post__action"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: props.title,
                url: window.location.origin + '/p/' + props.id,
              }).catch(() => {});
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
