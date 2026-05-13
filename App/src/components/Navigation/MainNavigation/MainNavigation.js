import React from 'react';
import { NavLink } from 'react-router-dom';

import MobileToggle from '../MobileToggle/MobileToggle';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';

import './MainNavigation.css';

const todayDateline = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

const mainNavigation = props => (
  <nav className="main-nav">
    <MobileToggle onOpen={props.onOpenMobileNav} />

    <NavLink to="/" className="main-nav__logo">
      <Logo />
    </NavLink>

    <div className="main-nav__dateline" aria-hidden="true">
      <span className="main-nav__vol">Vol. I &middot; No. 01</span>
      <span className="main-nav__date">{todayDateline()}</span>
    </div>

    <ul className="main-nav__items">
      <NavigationItems isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);

export default mainNavigation;
