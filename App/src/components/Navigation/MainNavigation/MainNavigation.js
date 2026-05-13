import React from 'react';
import { NavLink } from 'react-router-dom';

import MobileToggle from '../MobileToggle/MobileToggle';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';

import './MainNavigation.css';

const mainNavigation = props => (
  <nav className="main-nav">
    <MobileToggle onOpen={props.onOpenMobileNav} />

    <NavLink to="/" className="main-nav__logo">
      <Logo />
    </NavLink>

    <div className="main-nav__spacer" />

    <ul className="main-nav__items">
      <NavigationItems isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);

export default mainNavigation;
