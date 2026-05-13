import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

// Only unauthenticated nav items live here now. Authenticated users
// access logout via the avatar UserMenu in the top-right, and Home is
// reachable via the logo. The mobile drawer still shows everything.
const navItems = [
  { id: 'login',  text: 'Log in',  link: '/',       auth: false },
  { id: 'signup', text: 'Sign up', link: '/signup', auth: false },
  { id: 'feed',   text: 'Home',    link: '/',       auth: true, mobileOnly: true },
];

const navigationItems = props => {
  const items = navItems.filter((item) => {
    if (item.auth !== props.isAuth) return false;
    if (item.mobileOnly && !props.mobile) return false;
    return true;
  });

  return [
    ...items.map((item) => (
      <li
        key={item.id}
        className={['nav-item', props.mobile ? 'nav-item--mobile' : ''].join(' ')}
      >
        <NavLink to={item.link} exact onClick={props.onChoose}>
          {item.text}
        </NavLink>
      </li>
    )),
    props.isAuth && props.mobile && (
      <li className="nav-item nav-item--mobile" key="logout">
        <button onClick={props.onLogout}>Log out</button>
      </li>
    ),
  ];
};

export default navigationItems;
