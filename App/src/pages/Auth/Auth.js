import React from 'react';

import './Auth.css';

const auth = props => (
  <section className="auth">
    <div className="auth__masthead">
      <span className="auth__eyebrow">{props.eyebrow || 'A writing journal'}</span>
      <h1 className="auth__title">{props.title}</h1>
      <p className="auth__lede">{props.lede}</p>
      <div className="auth__rule" />
    </div>

    <div className="auth__form">
      {props.children}
    </div>

    {props.footer && (
      <div className="auth__footer">{props.footer}</div>
    )}
  </section>
);

export default auth;
