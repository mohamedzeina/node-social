import React from 'react';
import ReactDOM from 'react-dom';

import Button from '../Button/Button';
import './Modal.css';

const modal = props =>
  ReactDOM.createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal__corner modal__corner--tl" />
      <div className="modal__corner modal__corner--tr" />
      <div className="modal__corner modal__corner--bl" />
      <div className="modal__corner modal__corner--br" />

      <header className="modal__header">
        <span className="modal__eyebrow">Editor&apos;s desk</span>
        <h1 id="modal-title" className="modal__title">{props.title}</h1>
        <div className="modal__rule" />
      </header>

      <div className="modal__content">{props.children}</div>

      <div className="modal__actions">
        <Button design="danger" mode="flat" onClick={props.onCancelModal}>
          Cancel
        </Button>
        <Button
          mode="raised"
          onClick={props.onAcceptModal}
          disabled={!props.acceptEnabled}
          loading={props.isLoading}
        >
          Set in print
        </Button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );

export default modal;
