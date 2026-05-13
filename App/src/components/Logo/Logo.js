import React from 'react';

import './Logo.css';

const logo = () => (
  <div className="logo" aria-label="NodeSocial — Dispatches">
    <span className="logo__mark">N°</span>
    <span className="logo__wordmark">
      <span className="logo__primary">NodeSocial</span>
      <span className="logo__strap">Dispatches &middot; Est. MMXXVI</span>
    </span>
  </div>
);

export default logo;
