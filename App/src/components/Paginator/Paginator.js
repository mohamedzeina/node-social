import React from 'react';

import './Paginator.css';

const paginator = props => {
  const { currentPage, lastPage } = props;
  const totalDots = Math.max(lastPage || 1, 1);

  return (
    <div className="paginator">
      {props.children}

      <nav className="paginator__controls" aria-label="Pagination">
        <button
          className="paginator__control paginator__control--prev"
          onClick={props.onPrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <span className="paginator__arrow">&larr;</span>
          <span className="paginator__label">Previous folio</span>
        </button>

        <div className="paginator__counter" aria-hidden="true">
          <span className="paginator__current">
            {String(currentPage).padStart(2, '0')}
          </span>
          <span className="paginator__divider">/</span>
          <span className="paginator__total">
            {String(totalDots).padStart(2, '0')}
          </span>
        </div>

        <button
          className="paginator__control paginator__control--next"
          onClick={props.onNext}
          disabled={currentPage >= lastPage}
          aria-label="Next page"
        >
          <span className="paginator__label">Next folio</span>
          <span className="paginator__arrow">&rarr;</span>
        </button>
      </nav>
    </div>
  );
};

export default paginator;
