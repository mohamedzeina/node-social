import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    loading: true,
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `
      query FetchSinglePost($postId: ID!){
        getPost(id: $postId) {
          title
          content
          creator {
            name
          }
          imageUrl
          createdAt
        }
      }
      `,
      variables: {
        postId: postId,
      },
    };
    fetch('https://node-social-zmra.onrender.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (
          resData.errors &&
          (resData.errors.status === 401 || resData.errors.status === 404)
        ) {
          throw new Error(resData.errors.message);
        }

        if (resData.errors) {
          throw new Error('Fetching post failed.');
        }
        this.setState({
          title: resData.data.getPost.title,
          author: resData.data.getPost.creator.name,
          image: resData.data.getPost.imageUrl,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString(
            'en-GB',
            { day: 'numeric', month: 'long', year: 'numeric' }
          ),
          content: resData.data.getPost.content,
          loading: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
      });
  }

  render() {
    const initial = (this.state.author || '').trim().charAt(0).toUpperCase() || '?';
    const wordCount = this.state.content
      ? this.state.content.trim().split(/\s+/).length
      : 0;
    const minutes = Math.max(1, Math.ceil(wordCount / 220));

    return (
      <article className="single-post">
        <Link to="/" className="single-post__back">
          &larr; Back to The Feed
        </Link>

        <header className="single-post__masthead">
          <span className="single-post__eyebrow">A dispatch</span>
          <h1 className="single-post__title">{this.state.title || '—'}</h1>
          <div className="single-post__rule" />
          <div className="single-post__meta">
            <div className="single-post__byline">
              <span className="single-post__initial" aria-hidden="true">{initial}</span>
              <div>
                <span className="single-post__author">By {this.state.author || '—'}</span>
                <span className="single-post__dateline">{this.state.date}</span>
              </div>
            </div>
            <div className="single-post__readtime">
              <span>{minutes} min read</span>
              <span>&middot;</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </header>

        {this.state.image && (
          <figure className="single-post__plate">
            <div className="single-post__image">
              <Image contain imageUrl={this.state.image} />
            </div>
            <figcaption>Plate &mdash; filed by {this.state.author}</figcaption>
          </figure>
        )}

        <div className="single-post__content">
          <p className="single-post__body dropcap">{this.state.content}</p>
        </div>

        <footer className="single-post__footer">
          <span className="single-post__mark">&sect;</span>
          <p className="single-post__colophon">
            End of dispatch. &mdash; Filed {this.state.date} by {this.state.author}.
          </p>
          <Link to="/" className="single-post__back">
            &larr; Return to The Feed
          </Link>
        </footer>
      </article>
    );
  }
}

export default SinglePost;
