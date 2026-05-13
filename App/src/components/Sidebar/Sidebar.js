import React from 'react';
import { NavLink, Link } from 'react-router-dom';

import { Chevron } from '../Icons/Icons';
import Skeleton from '../Skeleton/Skeleton';
import './Sidebar.css';

const Sidebar = ({ currentUser, postCount, postsLoading }) => {
  const profileLink = currentUser && currentUser._id ? `/u/${currentUser._id}` : null;

  // Profile is already accessible from the profile card CTA and the
  // navbar avatar menu, so it's intentionally not in this nav rail.
  const navItems = [
    { id: 'home',   label: 'Home',          icon: '⌂', link: '/', active: true },
    { id: 'saved',  label: 'Saved',         icon: '✦', soon: true },
    { id: 'notifs', label: 'Notifications', icon: '◔', soon: true },
  ];

  const name = (currentUser && currentUser.name) || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const avatar = currentUser && currentUser.avatarUrl;
  const status = (currentUser && currentUser.status) || 'No status yet';

  return (
    <aside className="sidebar" aria-label="Account and quick navigation">
      {/* Profile card */}
      <div className="sidebar__card sidebar__profile">
        {currentUser ? (
          <>
            <span className="sidebar__profile-avatar" aria-hidden="true">
              {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
            </span>

            <div className="sidebar__profile-body">
              <span className="sidebar__profile-name">{name || 'Welcome'}</span>
              <span className="sidebar__profile-status">
                <span className="sidebar__profile-status-mark" aria-hidden="true">“</span>
                {status}
                <span className="sidebar__profile-status-mark" aria-hidden="true">”</span>
              </span>
            </div>

            {profileLink && (
              <Link to={profileLink} className="sidebar__profile-cta">
                <span>View your profile</span>
                <Chevron size={14} style={{ transform: 'rotate(-90deg)' }} />
              </Link>
            )}
          </>
        ) : (
          /* Skeleton state while currentUser loads */
          <div className="sidebar__profile-skeleton" aria-busy="true">
            <Skeleton variant="circle" width="4.5rem" height="4.5rem" />
            <Skeleton variant="text" width="60%" height="1.25rem" />
            <Skeleton variant="text" width="85%" />
            <div className="sidebar__profile-cta sidebar__profile-cta--skeleton">
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        )}
      </div>

      {/* Quick nav */}
      <nav className="sidebar__card sidebar__nav" aria-label="Quick links">
        <span className="sidebar__heading">Browse</span>
        <ul>
          {navItems.map((item) => (
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
        <span className="sidebar__tip-mark" aria-hidden="true">❦</span>
        <div className="sidebar__tip-body">
          <strong className="sidebar__tip-title">Slow social</strong>
          <p className="sidebar__tip-text">
            Two dispatches per page, sorted newest first. Currently{' '}
            {postsLoading ? (
              <Skeleton
                variant="text"
                width="1.5rem"
                height="0.85em"
                className="sidebar__tip-count-skeleton"
              />
            ) : (
              <strong>{typeof postCount === 'number' ? postCount : 0}</strong>
            )}{' '}
            in the feed.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
