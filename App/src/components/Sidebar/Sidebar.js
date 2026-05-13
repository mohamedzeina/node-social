import React from 'react';
import { NavLink, Link } from 'react-router-dom';

import { Chevron } from '../Icons/Icons';
import Skeleton from '../Skeleton/Skeleton';
import './Sidebar.css';

const Sidebar = ({ currentUser, postCount, postsLoading }) => {
  // Treat the whole sidebar as loading until BOTH the auth user and
  // the post count have arrived — avoids the patchy half-real,
  // half-shimmer look. Once everything is in, swap to real content
  // in one coherent reveal.
  const loading = !currentUser || postsLoading;

  if (loading) {
    return (
      <aside className="sidebar" aria-label="Loading" aria-busy="true">
        {/* Profile card skeleton */}
        <div className="sidebar__card sidebar__profile">
          <div className="sidebar__profile-skeleton">
            <Skeleton variant="circle" width="4.5rem" height="4.5rem" />
            <Skeleton variant="text" width="60%" height="1.25rem" />
            <Skeleton variant="text" width="85%" />
            <div className="sidebar__profile-cta sidebar__profile-cta--skeleton">
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div>

        {/* Nav skeleton */}
        <nav className="sidebar__card sidebar__nav">
          <Skeleton variant="text" width="3rem" height="0.7rem" style={{ marginBottom: '0.4rem', marginLeft: '0.55rem' }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="sidebar__link sidebar__link--skeleton">
              <Skeleton variant="rect" width="1.6rem" height="1.6rem" radius="10px" />
              <Skeleton variant="text" width={`${48 + i * 8}%`} />
            </div>
          ))}
        </nav>

        {/* Tip card skeleton */}
        <div className="sidebar__card sidebar__tip">
          <Skeleton variant="circle" width="1.4rem" height="1.4rem" />
          <div className="sidebar__tip-body" style={{ flex: 1, gap: '0.4rem' }}>
            <Skeleton variant="text" width="55%" height="0.95rem" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="78%" />
          </div>
        </div>
      </aside>
    );
  }

  // Loaded state — real content
  const profileLink = currentUser._id ? `/u/${currentUser._id}` : null;

  const navItems = [
    { id: 'home',   label: 'Home',          icon: '⌂', link: '/', active: true },
    { id: 'saved',  label: 'Saved',         icon: '✦', soon: true },
    { id: 'notifs', label: 'Notifications', icon: '◔', soon: true },
  ];

  const name = currentUser.name || '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const avatar = currentUser.avatarUrl;
  const status = currentUser.status || 'No status yet';

  return (
    <aside className="sidebar" aria-label="Account and quick navigation">
      {/* Profile card */}
      <div className="sidebar__card sidebar__profile">
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
            <strong>{typeof postCount === 'number' ? postCount : 0}</strong>{' '}
            in the feed.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
