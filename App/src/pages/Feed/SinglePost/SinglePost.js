import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import Skeleton from '../../../components/Skeleton/Skeleton';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Comment from '../../../components/Comment/Comment';
import CommentComposer from '../../../components/Comment/CommentComposer';
import ErrorHandler from '../../../components/ErrorHandler/ErrorHandler';
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
    } catch (err) {
      this.setState({ liked: !nextLiked, likeCount: prevCount });
      console.error('Like toggle failed', err);
    } finally {
      this.setState({ likePending: false });
    }
  };

  // ---- Comments ----------------------------------------

  addComment = async (content) => {
    const postId = this.props.match.params.postId;

    // Build an optimistic comment. Negative tempId so it never
    // collides with real Mongo ObjectIds and is easy to swap.
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      content,
      createdAt: new Date().toISOString(),
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
        mutation AddComment($postId: ID!, $content: String!) {
          addComment(postId: $postId, content: $content) {
            _id
            content
            createdAt
            author { _id name avatarUrl }
          }
        }
      `,
      variables: { postId, content },
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

      // Replace the optimistic placeholder with the server's record
      const real = data.data.addComment;
      this.setState((prev) => ({
        comments: prev.comments.map((c) => (c._id === tempId ? real : c)),
      }));
    } catch (err) {
      // Roll back the optimistic insert and surface the error
      this.setState((prev) => ({
        comments: prev.comments.filter((c) => c._id !== tempId),
        error: err,
      }));
      throw err;
    }
  };

  deleteComment = async (id) => {
    // Hold on to the comment in case we need to restore it
    const previous = this.state.comments;
    this.setState((prev) => ({
      comments: prev.comments.filter((c) => c._id !== id),
    }));

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
    } catch (err) {
      this.setState({ comments: previous, error: err });
    }
  };

  dismissError = () => this.setState({ error: null });

  render() {
    const initial = (this.state.author || '').trim().charAt(0).toUpperCase() || '?';
    const { liked, likeCount, likePending, loading } = this.state;

    if (loading) {
      return (
        <div className="app-page">
          <div className="app-page__sidebar">
            <Sidebar currentUser={this.props.currentUser} />
          </div>
          <div className="app-page__main">
            <article className="single-post">
              <div className="single-post__back-skeleton">
                <Skeleton width="5rem" height="1.6rem" radius="999px" />
              </div>
              <div className="single-post__card">
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
              </div>
            </article>
          </div>
        </div>
      );
    }

    return (
      <div className="app-page">
        <div className="app-page__sidebar">
          <Sidebar currentUser={this.props.currentUser} />
        </div>

        <div className="app-page__main">
        <ErrorHandler error={this.state.error} onHandle={this.dismissError} />
        <article className="single-post">
        <Link to="/" className="single-post__back">
          ← Back to Home
        </Link>

        <div className="single-post__card">
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

          <div className="single-post__content">
            {this.state.content}
          </div>

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

          {/* ---- Comments section ----------------------- */}
          <section className="single-post__comments" aria-label="Comments">
            <div className="single-post__comments-head">
              <h2 className="single-post__comments-title">Comments</h2>
              <span className="single-post__comments-count">
                {this.state.comments.length} {this.state.comments.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>

            <CommentComposer
              currentUser={this.props.currentUser}
              onSubmit={this.addComment}
            />

            {this.state.comments.length === 0 ? (
              <div className="single-post__comments-empty">
                <p>No replies yet. Be the first to say something.</p>
              </div>
            ) : (
              <ul className="single-post__comments-list">
                {this.state.comments.map((c) => (
                  <li key={c._id}>
                    <Comment
                      comment={c}
                      pending={!!c.__pending}
                      isOwn={c.author && c.author._id === this.props.userId}
                      onDelete={this.deleteComment}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </article>
        </div>
      </div>
    );
  }
}

export default SinglePost;
