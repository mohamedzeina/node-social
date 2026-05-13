import React from 'react';

import './Paginator.css';

const paginator = props => {
  const { currentPage, lastPage } = props;
  const total = Math.max(lastPage || 1, 1);

  return (
    <div className="paginator">
      {props.children}

      <nav className="paginator__controls" aria-label="Pagination">
        <button
          className="paginator__btn"
          onClick={props.onPrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Newer</span>
        </button>

        <span className="paginator__count" aria-hidden="true">
          Page {currentPage} of {total}
        </span>

        <button
          className="paginator__btn"
          onClick={props.onNext}
          disabled={currentPage >= lastPage}
          aria-label="Next page"
        >
          <span>Older</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </nav>
    </div>
  );
};

export default paginator;
