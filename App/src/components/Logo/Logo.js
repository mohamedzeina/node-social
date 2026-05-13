import React from 'react';

import './Logo.css';

const logo = () => (
  <div className="logo" aria-label="Dispatches">
    <span className="logo__mark">D°</span>
    <span className="logo__wordmark">
      <span className="logo__primary">Dispatches</span>
      <span className="logo__strap">A writing journal &middot; Est. MMXXVI</span>
    </span>
  </div>
);

export default logo;
