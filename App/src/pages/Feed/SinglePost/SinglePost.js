import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import Skeleton from '../../../components/Skeleton/Skeleton';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Comment from '../../../components/Comment/Comment';
import CommentComposer from '../../../components/Comment/CommentComposer';
import ErrorHandler from '../../../components/ErrorHandler/ErrorHandler';
import { Close } from '../../../components/Icons/Icons';
import './SinglePost.css';

const API_URL = 'https://node-social-zmra.onrender.com/graphql';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    authorAvatar: null,
    authorId: null,
    date: '',
    image: '',
    content: '',
    loading: true,
    liked: false,
    likeCount: 0,
    likePending: false,
    comments: [],
    error: null,
  };

  componentDidMount() {
    if (this.props.asModal) {
      document.addEventListener('keydown', this.handleEscape);
      // Prevent the page underneath from scrolling while the modal is open
      this.prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `
      query FetchSinglePost($postId: ID!){
        getPost(id: $postId) {
          title
          content
          creator { _id name avatarUrl }
          imageUrl
          createdAt
          likeCount
          likedByMe
          commentCount
          comments {
            _id
            content
            createdAt
            parent
            author { _id name avatarUrl }
          }
        }
      }
      `,
      variables: { postId },
    };
    fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.errors && (resData.errors.status === 401 || resData.errors.status === 404)) {
          throw new Error(resData.errors.message);
        }
        if (resData.errors) throw new Error('Fetching post failed.');
        this.setState({
          title: resData.data.getPost.title,
          author: resData.data.getPost.creator.name,
          authorAvatar: resData.data.getPost.creator.avatarUrl,
          authorId: resData.data.getPost.creator._id,
          image: resData.data.getPost.imageUrl,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          }),
          content: resData.data.getPost.content,
          liked: resData.data.getPost.likedByMe,
          likeCount: resData.data.getPost.likeCount,
          comments: resData.data.getPost.comments || [],
          loading: false,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ loading: false });
      });
  }

  toggleLike = async () => {
    if (this.state.likePending || !this.props.token) return;
    const postId = this.props.match.params.postId;
    const nextLiked = !this.state.liked;
    const prevCount = this.state.likeCount;
    const nextCount = prevCount + (nextLiked ? 1 : -1);

    this.setState({ liked: nextLiked, likeCount: nextCount, likePending: true });

    const mutation = nextLiked ? 'likePost' : 'unlikePost';
    const query = {
      query: `mutation L($id: ID!) { ${mutation}(id: $id) { _id likeCount likedByMe } }`,
      variables: { id: postId },
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);
      const fresh = data.data[mutation];
      this.setState({ liked: fresh.likedByMe, likeCount: fresh.likeCount });
      if (this.props.onPostUpdate) {
        this.props.onPostUpdate(postId, {
          likeCount: fresh.likeCount,
          likedByMe: fresh.likedByMe,
        });
      }
    } catch (err) {
      this.setState({ liked: !nextLiked, likeCount: prevCount });
      console.error('Like toggle failed', err);
    } finally {
      this.setState({ likePending: false });
    }
  };

  // ---- Comments ----------------------------------------

  /**
   * Add a comment or reply. Pass parentId to nest under another
   * comment, or null for a top-level comment. Optimistic update
   * inserts a temporary record with __pending: true so the new
   * node renders immediately.
   */
  addComment = async (parentId, content) => {
    const postId = this.props.match.params.postId;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: tempId,
      content,
      createdAt: new Date().toISOString(),
      parent: parentId || null,
      author: this.props.currentUser
        ? {
            _id: this.props.currentUser._id,
            name: this.props.currentUser.name,
            avatarUrl: this.props.currentUser.avatarUrl,
          }
        : { _id: this.props.userId, name: 'You', avatarUrl: null },
      __pending: true,
    };
    this.setState((prev) => ({ comments: [...prev.comments, optimistic] }));

    const query = {
      query: `
        mutation AddComment($postId: ID!, $content: String!, $parentId: ID) {
          addComment(postId: $postId, content: $content, parentId: $parentId) {
            _id
            content
            createdAt
            parent
            author { _id name avatarUrl }
          }
        }
      `,
      variables: { postId, content, parentId: parentId || null },
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);

      const real = data.data.addComment;
      let nextLength = 0;
      this.setState(
        (prev) => {
          const comments = prev.comments.map((c) => (c._id === tempId ? real : c));
          nextLength = comments.length;
          return { comments };
        },
        () => {
          if (this.props.onPostUpdate) {
            this.props.onPostUpdate(postId, { commentCount: nextLength });
          }
        }
      );
    } catch (err) {
      this.setState((prev) => ({
        comments: prev.comments.filter((c) => c._id !== tempId),
        error: err,
      }));
      throw err;
    }
  };

  deleteComment = async (id) => {
    // Hold on to the comment in case we need to restore it.
    // Cascade locally: drop the target + any descendants so the count
    // matches what the server is about to do.
    const previous = this.state.comments;
    const childrenByParent = new Map();
    for (const c of previous) {
      const k = c.parent || null;
      if (!childrenByParent.has(k)) childrenByParent.set(k, []);
      childrenByParent.get(k).push(c._id);
    }
    const toRemove = new Set([id]);
    const frontier = [id];
    while (frontier.length) {
      const next = frontier.shift();
      const kids = childrenByParent.get(next) || [];
      for (const k of kids) {
        if (!toRemove.has(k)) {
          toRemove.add(k);
          frontier.push(k);
        }
      }
    }
    const remaining = previous.filter((c) => !toRemove.has(c._id));
    this.setState({ comments: remaining });

    const query = {
      query: `mutation DeleteComment($id: ID!) { deleteComment(id: $id) }`,
      variables: { id },
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.props.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);
      if (this.props.onPostUpdate) {
        this.props.onPostUpdate(this.props.match.params.postId, {
          commentCount: remaining.length,
        });
      }
    } catch (err) {
      this.setState({ comments: previous, error: err });
    }
  };

  componentWillUnmount() {
    if (this.props.asModal) {
      document.removeEventListener('keydown', this.handleEscape);
      document.body.style.overflow = this.prevBodyOverflow || '';
    }
  }

  handleEscape = (e) => {
    if (e.key === 'Escape' && this.props.onClose) {
      this.props.onClose();
    }
  };

  /**
   * Close when the click lands on the scroll-container itself
   * (the "backdrop" area around the card) — not on the card or its
   * descendants. The Backdrop component in App.js sits visually
   * behind us at z-index 200 but our scroll-container covers it
   * (inset: 0, z-index 280), so we own the dismiss behaviour here.
   */
  handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && this.props.onClose) {
      this.props.onClose();
    }
  };

  dismissError = () => this.setState({ error: null });

  // ---------- Helpers for the inner content (shared by page + modal) ----------

  renderSkeletonCard() {
    const isModal = !!this.props.asModal;
    return (
      <div className="single-post__card">
        {isModal && (
          <button
            type="button"
            className="single-post__close"
            onClick={this.props.onClose}
            aria-label="Close"
          >
            <Close size={16} />
          </button>
        )}
        <header className="single-post__header">
          <Skeleton variant="circle" width="2.6rem" height="2.6rem" />
          <div className="single-post__byline" style={{ flex: 1, maxWidth: '14rem' }}>
            <Skeleton variant="text" width="45%" />
            <div style={{ height: '0.35rem' }} />
            <Skeleton variant="text" width="30%" />
          </div>
        </header>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <Skeleton variant="text" width="80%" height="2rem" />
          <Skeleton variant="text" width="55%" height="2rem" />
        </div>
        <div className="single-post__image">
          <Skeleton width="100%" height="100%" radius={0} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <Skeleton variant="text" width="98%" />
          <Skeleton variant="text" width="94%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="72%" />
        </div>
        <footer className="single-post__footer">
          <Skeleton width="9rem" height="2.5rem" radius="999px" />
        </footer>

        <section className="single-post__comments" aria-busy="true">
          <div className="single-post__comments-head">
            <Skeleton variant="text" width="5rem" height="1.1rem" />
            <Skeleton width="4.5rem" height="1.4rem" radius="999px" />
          </div>
          <div className="single-post__composer-skeleton">
            <Skeleton variant="circle" width="2.1rem" height="2.1rem" />
            <div className="single-post__composer-skeleton-body">
              <Skeleton variant="rect" height="2.4rem" radius="14px" />
              <div className="single-post__composer-skeleton-footer">
                <Skeleton width="6rem" height="2rem" radius="999px" />
              </div>
            </div>
          </div>
          <ul className="single-post__comments-list">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <div className="comment" aria-busy="true">
                  <Skeleton variant="circle" width="2.1rem" height="2.1rem" />
                  <div className="comment__bubble">
                    <div className="comment__head" style={{ width: '100%' }}>
                      <Skeleton variant="text" width={`${30 + i * 8}%`} height="0.85rem" />
                      <Skeleton variant="text" width="2.5rem" height="0.75rem" />
                    </div>
                    <Skeleton variant="text" width="100%" />
                    <div style={{ height: '0.3rem' }} />
                    <Skeleton variant="text" width={`${68 + i * 6}%`} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  renderCard() {
    const initial = (this.state.author || '').trim().charAt(0).toUpperCase() || '?';
    const { liked, likeCount, likePending } = this.state;
    const isModal = !!this.props.asModal;

    // Build the comment tree from the flat list.
    const byId = new Map();
    for (const c of this.state.comments) {
      byId.set(c._id, { ...c, replies: [] });
    }
    const roots = [];
    for (const node of byId.values()) {
      if (node.parent && byId.has(node.parent)) {
        byId.get(node.parent).replies.push(node);
      } else {
        roots.push(node);
      }
    }
    const total = this.state.comments.length;

    return (
      <div className="single-post__card">
        {isModal && (
          <button
            type="button"
            className="single-post__close"
            onClick={this.props.onClose}
            aria-label="Close"
          >
            <Close size={16} />
          </button>
        )}
        <header className="single-post__header">
          {this.state.authorId ? (
            <Link
              to={`/u/${this.state.authorId}`}
              className="single-post__avatar single-post__avatar--link"
              aria-label={`View ${this.state.author}'s profile`}
            >
              {this.state.authorAvatar ? (
                <img src={this.state.authorAvatar} alt="" />
              ) : (
                <span>{initial}</span>
              )}
            </Link>
          ) : (
            <div className="single-post__avatar" aria-hidden="true">
              {this.state.authorAvatar ? (
                <img src={this.state.authorAvatar} alt="" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
          )}
          <div className="single-post__byline">
            {this.state.authorId ? (
              <Link to={`/u/${this.state.authorId}`} className="single-post__author">
                {this.state.author || '—'}
              </Link>
            ) : (
              <span className="single-post__author">{this.state.author || '—'}</span>
            )}
            <span className="single-post__date">{this.state.date}</span>
          </div>
        </header>

        <h1 className="single-post__title">{this.state.title || ''}</h1>

        {this.state.image && (
          <div className="single-post__image">
            <Image contain imageUrl={this.state.image} />
          </div>
        )}

        <div className="single-post__content">{this.state.content}</div>

        <footer className="single-post__footer">
          <button
            type="button"
            className={[
              'single-post__like',
              liked ? 'is-liked' : '',
              likePending ? 'is-pending' : '',
            ].join(' ')}
            onClick={this.toggleLike}
            aria-pressed={liked}
          >
            <span className="single-post__like-icon" aria-hidden="true">
              {liked ? '♥' : '♡'}
            </span>
            <span>
              {likeCount > 0
                ? `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`
                : 'Be the first to like this'}
            </span>
          </button>
        </footer>

        <section className="single-post__comments" aria-label="Comments">
          <div className="single-post__comments-head">
            <h2 className="single-post__comments-title">Comments</h2>
            <span className="single-post__comments-count">
              {total} {total === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          <CommentComposer
            currentUser={this.props.currentUser}
            onSubmit={(text) => this.addComment(null, text)}
          />

          {roots.length === 0 ? (
            <div className="single-post__comments-empty">
              <p>No replies yet. Be the first to say something.</p>
            </div>
          ) : (
            <ul className="single-post__comments-list">
              {roots.map((c) => (
                <li key={c._id}>
                  <Comment
                    comment={c}
                    depth={0}
                    viewerId={this.props.userId}
                    currentUser={this.props.currentUser}
                    onAddReply={this.addComment}
                    onDelete={this.deleteComment}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    const inner = loading ? this.renderSkeletonCard() : this.renderCard();

    // ---- Modal mode (opened from feed / profile) ----
    if (this.props.asModal) {
      return (
        <div
          className="single-post-modal"
          role="dialog"
          aria-modal="true"
          onClick={this.handleBackdropClick}
        >
          <article className="single-post single-post--modal">
            <ErrorHandler error={this.state.error} onHandle={this.dismissError} />
            {inner}
          </article>
        </div>
      );
    }

    // ---- Page mode (direct URL / refresh) ----
    return (
      <div className="app-page">
        <div className="app-page__sidebar">
          <Sidebar currentUser={this.props.currentUser} />
        </div>

        <div className="app-page__main">
          <ErrorHandler error={this.state.error} onHandle={this.dismissError} />
          <article className="single-post">
            {loading ? (
              <div className="single-post__back-skeleton">
                <Skeleton width="5rem" height="1.6rem" radius="999px" />
              </div>
            ) : (
              <Link to="/" className="single-post__back">
                ← Back to Home
              </Link>
            )}
            {inner}
          </article>
        </div>
      </div>
    );
  }
}

export default SinglePost;
