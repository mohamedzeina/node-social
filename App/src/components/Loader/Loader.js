import React from 'react';

import './Loader.css';

const loader = () => (
  <div className="loader" role="status" aria-live="polite">
    <div className="loader__rule" />
    <div className="loader__label">
      <span>S</span>
      <span>e</span>
      <span>t</span>
      <span>t</span>
      <span>i</span>
      <span>n</span>
      <span>g</span>
      <span>&nbsp;</span>
      <span>t</span>
      <span>y</span>
      <span>p</span>
      <span>e</span>
      <span>&hellip;</span>
    </div>
    <div className="loader__rule" />
  </div>
);

export default loader;
