import React from 'react';

import './Auth.css';

const auth = props => (
  <section className="auth">
    <div className="auth__card">
      <header className="auth__header">
        <h1 className="auth__title">{props.title}</h1>
        {props.lede && <p className="auth__lede">{props.lede}</p>}
      </header>

      <div className="auth__form">{props.children}</div>

      {props.footer && <div className="auth__footer">{props.footer}</div>}
    </div>
  </section>
);

export default auth;
