import React from 'react';
import { Link } from 'react-router-dom';

import './Button.css';

const ButtonLoading = () => (
  <span className="button__loading" aria-label="Loading">
    <span />
    <span />
    <span />
  </span>
);

const button = props => {
  const classes = [
    'button',
    props.design ? `button--${props.design}` : '',
    props.mode ? `button--${props.mode}` : ''
  ].join(' ');

  if (props.link) {
    return (
      <Link className={classes} to={props.link}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      type={props.type}
    >
      {props.loading ? <ButtonLoading /> : props.children}
    </button>
  );
};

export default button;
