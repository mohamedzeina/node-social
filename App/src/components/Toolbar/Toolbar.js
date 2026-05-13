import React from 'react';

import './Toolbar.css';

const toolbar = props => (
  <div className="toolbar">
    <div className="toolbar__inner">{props.children}</div>
    <div className="toolbar__hairline" aria-hidden="true" />
  </div>
);

export default toolbar;
