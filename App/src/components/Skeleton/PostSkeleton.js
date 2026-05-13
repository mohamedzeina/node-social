import React from 'react';

import Skeleton from './Skeleton';
import './PostSkeleton.css';

/**
 * Skeleton matching the Post card layout: same paddings, hairlines,
 * byline weights, and footer action pills as the real Post — so the
 * transition from loading to loaded doesn't shift anything.
 *
 * Footer action widths are tuned to the actual rendered label widths
 * of Like / Reply / Share (Plus Jakarta Sans 600 ~0.88rem). Reply
 * intentionally wider than Like (longer word), Share widest of all.
 * Icon size is 1.125rem = 18px exactly, matching size={18} on the
 * real Heart / Reply / Share SVGs.
 */
const ACTION_LABEL_WIDTHS = ['1.8rem', '2.05rem', '2.4rem'];
const ICON_SIZE = '1.125rem';

const PostSkeleton = () => (
  <article className="post-skeleton" aria-busy="true" aria-label="Loading post">
    <header className="post-skeleton__header">
      <Skeleton variant="circle" width="2.4rem" height="2.4rem" />
      <div className="post-skeleton__byline">
        {/* Author name — bold, larger */}
        <Skeleton variant="text" width="38%" height="0.95rem" />
        {/* Date — smaller, muted */}
        <Skeleton variant="text" width="22%" height="0.74rem" />
      </div>
    </header>

    <div className="post-skeleton__body">
      {/* Title — display weight, taller */}
      <Skeleton variant="text" width="72%" height="1.35rem" />
      {/* 3-line content clamp */}
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="94%" />
      <Skeleton variant="text" width="58%" />
    </div>

    <div className="post-skeleton__image">
      <Skeleton width="100%" height="100%" radius={0} />
    </div>

    <div className="post-skeleton__footer">
      {ACTION_LABEL_WIDTHS.map((labelWidth, i) => (
        <div key={i} className="post-skeleton__action">
          <Skeleton variant="circle" width={ICON_SIZE} height={ICON_SIZE} />
          <Skeleton variant="text" width={labelWidth} height="0.85rem" />
        </div>
      ))}
    </div>
  </article>
);

export default PostSkeleton;
