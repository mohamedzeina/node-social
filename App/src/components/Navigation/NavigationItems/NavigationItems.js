import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

const navItems = [
  { id: 'feed',   text: 'The Feed',  link: '/',       auth: true  },
  { id: 'login',  text: 'Sign in',   link: '/',       auth: false },
  { id: 'signup', text: 'Subscribe', link: '/signup', auth: false }
];

const navigationItems = props => [
  ...navItems
    .filter(item => item.auth === props.isAuth)
    .map(item => (
      <li
        key={item.id}
        className={['nav-item', props.mobile ? 'nav-item--mobile' : ''].join(' ')}
      >
        <NavLink to={item.link} exact onClick={props.onChoose}>
          <span className="nav-item__text">{item.text}</span>
        </NavLink>
      </li>
    )),
  props.isAuth && (
    <li
      className={['nav-item', props.mobile ? 'nav-item--mobile' : ''].join(' ')}
      key="logout"
    >
      <button onClick={props.onLogout}>
        <span className="nav-item__text">Sign off</span>
      </button>
    </li>
  )
];

export default navigationItems;
