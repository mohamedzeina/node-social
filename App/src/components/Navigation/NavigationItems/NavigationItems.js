import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

const navItems = [
  { id: 'feed',   text: 'Home',    link: '/',       auth: true  },
  { id: 'login',  text: 'Log in',  link: '/',       auth: false },
  { id: 'signup', text: 'Sign up', link: '/signup', auth: false }
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
          {item.text}
        </NavLink>
      </li>
    )),
  props.isAuth && (
    <li
      className={['nav-item', props.mobile ? 'nav-item--mobile' : ''].join(' ')}
      key="logout"
    >
      <button onClick={props.onLogout}>Log out</button>
    </li>
  )
];

export default navigationItems;
