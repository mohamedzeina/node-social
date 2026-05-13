import React from 'react';

import './Logo.css';

const logo = () => (
  <div className="logo" aria-label="Dispatches">
    <span className="logo__mark" aria-hidden="true">
      <span className="logo__dot logo__dot--a" />
      <span className="logo__dot logo__dot--b" />
      <span className="logo__dot logo__dot--c" />
    </span>
    <span className="logo__wordmark">dispatches</span>
  </div>
);

export default logo;
