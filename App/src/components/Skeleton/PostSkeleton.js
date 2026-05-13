import React from 'react';

import Skeleton from './Skeleton';
import './PostSkeleton.css';

/**
 * Skeleton matching the Post card layout: avatar + byline + title +
 * three content lines + media block + action row.
 */
const PostSkeleton = () => (
  <article className="post-skeleton" aria-busy="true" aria-label="Loading post">
    <header className="post-skeleton__header">
      <Skeleton variant="circle" width="2.4rem" height="2.4rem" />
      <div className="post-skeleton__byline">
        <Skeleton variant="text" width="38%" />
        <Skeleton variant="text" width="22%" />
      </div>
    </header>

    <div className="post-skeleton__body">
      <Skeleton variant="text" width="72%" height="1.5rem" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="94%" />
      <Skeleton variant="text" width="58%" />
    </div>

    <Skeleton variant="rect" height="18rem" radius={0} />

    <div className="post-skeleton__footer">
      <Skeleton width="3.5rem" height="2rem" radius="999px" />
      <Skeleton width="3.5rem" height="2rem" radius="999px" />
      <Skeleton width="3.5rem" height="2rem" radius="999px" />
    </div>
  </article>
);

export default PostSkeleton;
