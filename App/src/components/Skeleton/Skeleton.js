import React from 'react';

import './Skeleton.css';

/**
 * Generic shimmer block.
 *
 * Props:
 * - variant: 'rect' (default) | 'text' | 'circle'
 * - width / height: any CSS dimension (string or number → px)
 * - radius: override the border-radius
 * - className: append a custom class
 * - style: forward inline style overrides
 *
 * Use the primitive directly for one-offs, or compose into purpose-
 * built skeletons (PostSkeleton, ProfileHeroSkeleton).
 */
const Skeleton = ({
  variant = 'rect',
  width,
  height,
  radius,
  className = '',
  style = {},
  ...rest
}) => {
  const toCss = (v) => (typeof v === 'number' ? `${v}px` : v);

  const inline = {
    ...style,
    ...(width !== undefined ? { width: toCss(width) } : null),
    ...(height !== undefined ? { height: toCss(height) } : null),
    ...(radius !== undefined ? { borderRadius: toCss(radius) } : null),
  };

  return (
    <span
      className={['skeleton', `skeleton--${variant}`, className].join(' ').trim()}
      style={inline}
      aria-hidden="true"
      {...rest}
    />
  );
};

export default Skeleton;
