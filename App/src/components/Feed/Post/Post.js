import React from 'react';

import Image from '../../Image/Image';
import Button from '../../Button/Button';
import './Post.css';

const post = props => {
  const initial = (props.author || '').trim().charAt(0).toUpperCase() || '?';
  const folio = props.index ? String(props.index).padStart(2, '0') : '01';

  return (
    <article className="post">
      <div className="post__folio" aria-hidden="true">{folio}</div>

      <header className="post__header">
        <div className="post__byline">
          <span className="post__initial" aria-hidden="true">{initial}</span>
          <div className="post__byline-text">
            <span className="post__author">{props.author}</span>
            <span className="post__date">{props.date}</span>
          </div>
        </div>
        <h2 className="post__title">{props.title}</h2>
      </header>

      <div className="post__image">
        <Image imageUrl={props.image} contain />
      </div>

      <div className="post__content">{props.content}</div>

      <div className="post__footer">
        <div className="post__divider" aria-hidden="true">
          <span>&sect;</span>
        </div>
        <div className="post__actions">
          <Button mode="flat" link={props.id}>
            Read in full
          </Button>
          <Button mode="flat" onClick={props.onStartEdit}>
            Revise
          </Button>
          <Button mode="flat" design="danger" onClick={props.onDelete}>
            Retract
          </Button>
        </div>
      </div>
    </article>
  );
};

export default post;
