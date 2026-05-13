import React from 'react';

import NavigationItems from '../NavigationItems/NavigationItems';
import Logo from '../../Logo/Logo';
import './MobileNavigation.css';

const mobileNavigation = props => (
  <nav
    className={['mobile-nav', props.open ? 'open' : ''].join(' ')}
    aria-hidden={!props.open}
  >
    <div className="mobile-nav__head">
      <Logo />
    </div>

    <ul className="mobile-nav__items">
      <NavigationItems
        mobile
        onChoose={props.onChooseItem}
        isAuth={props.isAuth}
        onLogout={props.onLogout}
      />
    </ul>
  </nav>
);

export default mobileNavigation;
