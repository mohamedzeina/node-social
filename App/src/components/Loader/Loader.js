import React from 'react';

import './Loader.css';

const loader = () => (
  <div className="loader" role="status" aria-label="Loading">
    <span className="loader__dot" />
    <span className="loader__dot" />
    <span className="loader__dot" />
  </div>
);

export default loader;
