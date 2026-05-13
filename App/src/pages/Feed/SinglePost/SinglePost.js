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
          creator { name }
          imageUrl
          createdAt
        }
      }
      `,
      variables: { postId },
    };
    fetch('https://node-social-zmra.onrender.com/graphql', {
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
          image: resData.data.getPost.imageUrl,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          }),
          content: resData.data.getPost.content,
          loading: false,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ loading: false });
      });
  }

  render() {
    const initial = (this.state.author || '').trim().charAt(0).toUpperCase() || '?';

    return (
      <article className="single-post">
        <Link to="/" className="single-post__back">
          ← Back to Home
        </Link>

        <div className="single-post__card">
          <header className="single-post__header">
            <div className="single-post__avatar" aria-hidden="true">{initial}</div>
            <div className="single-post__byline">
              <span className="single-post__author">{this.state.author || '—'}</span>
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
        </div>
      </article>
    );
  }
}

export default SinglePost;
