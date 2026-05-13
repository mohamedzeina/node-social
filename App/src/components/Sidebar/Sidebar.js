import React from 'react';
import { NavLink } from 'react-router-dom';

import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',          icon: '⌂', link: '/',         active: true },
  { id: 'profile',  label: 'Your profile',  icon: '☻', soon: true },
  { id: 'saved',    label: 'Saved',         icon: '✦', soon: true },
  { id: 'notifs',   label: 'Notifications', icon: '◔', soon: true },
];

const Sidebar = ({ currentUser, postCount }) => {
  const name = (currentUser && currentUser.name) || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const avatar = currentUser && currentUser.avatarUrl;
  const status = (currentUser && currentUser.status) || 'No status yet';

  return (
    <aside className="sidebar" aria-label="Account and quick navigation">
      {/* Profile card */}
      <div className="sidebar__card sidebar__profile">
        <div className="sidebar__profile-cover" aria-hidden="true" />

        <span className="sidebar__profile-avatar" aria-hidden="true">
          {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
        </span>

        <div className="sidebar__profile-body">
          <span className="sidebar__profile-name">{name || 'Welcome'}</span>
          <span className="sidebar__profile-status">{status}</span>
        </div>

        {typeof postCount === 'number' && (
          <div className="sidebar__stats">
            <div className="sidebar__stat">
              <span className="sidebar__stat-value">{postCount}</span>
              <span className="sidebar__stat-label">in the feed</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick nav */}
      <nav className="sidebar__card sidebar__nav" aria-label="Quick links">
        <span className="sidebar__heading">Browse</span>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              {item.link ? (
                <NavLink
                  to={item.link}
                  exact
                  className={['sidebar__link', item.active ? 'is-active' : ''].join(' ')}
                >
                  <span className="sidebar__link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar__link-label">{item.label}</span>
                </NavLink>
              ) : (
                <button
                  type="button"
                  className="sidebar__link sidebar__link--soon"
                  disabled
                  aria-disabled="true"
                >
                  <span className="sidebar__link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar__link-label">{item.label}</span>
                  {item.soon && <span className="sidebar__chip">Soon</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Tip card */}
      <div className="sidebar__card sidebar__tip">
        <span className="sidebar__tip-mark" aria-hidden="true">✿</span>
        <p className="sidebar__tip-text">
          <strong>Dispatches</strong> is a slow social platform.
          Two posts a page, no algorithm.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
