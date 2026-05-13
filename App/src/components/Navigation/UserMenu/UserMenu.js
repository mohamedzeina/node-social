import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

import './UserMenu.css';

const UserMenu = ({ currentUser, onLogout }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const name = (currentUser && currentUser.name) || '';
  const avatar = currentUser && currentUser.avatarUrl;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const firstName = name.trim().split(/\s+/)[0] || '';

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className={['user-menu__trigger', open ? 'is-open' : ''].join(' ')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${name || 'you'}`}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
        </span>
        <span className="user-menu__name">{firstName || 'You'}</span>
        <svg
          className="user-menu__caret"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path
            d="M1.5 3.5 L5 7 L8.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__header">
            <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden="true">
              {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
            </span>
            <div className="user-menu__identity">
              <span className="user-menu__display">{name || 'You'}</span>
              {currentUser && currentUser.status && (
                <span className="user-menu__status">{currentUser.status}</span>
              )}
            </div>
          </div>

          <hr className="user-menu__divider" />

          {currentUser && currentUser._id ? (
            <Link
              to={`/u/${currentUser._id}`}
              className="user-menu__item"
              role="menuitem"
              onClick={close}
            >
              <span className="user-menu__item-icon" aria-hidden="true">☻</span>
              View profile
            </Link>
          ) : (
            <button
              type="button"
              className="user-menu__item user-menu__item--soon"
              role="menuitem"
              disabled
            >
              <span className="user-menu__item-icon" aria-hidden="true">☻</span>
              View profile
            </button>
          )}

          <button
            type="button"
            className="user-menu__item user-menu__item--soon"
            role="menuitem"
            disabled
          >
            <span className="user-menu__item-icon" aria-hidden="true">⚙</span>
            Settings
            <span className="user-menu__chip">Soon</span>
          </button>

          <hr className="user-menu__divider" />

          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={() => {
              close();
              onLogout && onLogout();
            }}
          >
            <span className="user-menu__item-icon" aria-hidden="true">⎋</span>
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
