import React from 'react';

import NavigationItems from '../NavigationItems/NavigationItems';
import './MobileNavigation.css';

const mobileNavigation = props => (
  <nav
    className={['mobile-nav', props.open ? 'open' : ''].join(' ')}
    aria-hidden={!props.open}
  >
    <div className="mobile-nav__head">
      <span className="mobile-nav__eyebrow">Contents</span>
      <span className="mobile-nav__folio">Folio I</span>
    </div>

    <ul
      className={['mobile-nav__items', props.mobile ? 'mobile' : ''].join(' ')}
    >
      <NavigationItems
        mobile
        onChoose={props.onChooseItem}
        isAuth={props.isAuth}
        onLogout={props.onLogout}
      />
    </ul>

    <div className="mobile-nav__foot">
      <span className="mobile-nav__colophon">
        Set in Fraunces &amp; Newsreader
      </span>
    </div>
  </nav>
);

export default mobileNavigation;
