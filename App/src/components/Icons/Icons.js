import React from 'react';

/**
 * Lightweight SVG icon set.
 *
 * - All icons are 24x24 viewBox, stroke-based by default, scale via
 *   the `size` prop (defaults to 1em so they follow font-size).
 * - Use `currentColor` for fills and strokes so colour comes from
 *   the CSS context (button color, link color, etc.).
 * - Heart has two variants: stroke (Heart) and solid (HeartFilled).
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const make = (children) => ({ size = '1em', title, ...rest } = {}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
    {...base}
    {...rest}
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

export const Heart = make(
  <path d="M12 20.5s-7.2-4.35-9.4-9.05A4.85 4.85 0 0 1 11.05 5.7l.95.95.95-.95a4.85 4.85 0 0 1 8.45 5.75c-2.2 4.7-9.4 9.05-9.4 9.05Z" />
);

export const HeartFilled = ({ size = '1em', title, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    {...rest}
  >
    {title && <title>{title}</title>}
    <path d="M12 20.5s-7.2-4.35-9.4-9.05A4.85 4.85 0 0 1 11.05 5.7l.95.95.95-.95a4.85 4.85 0 0 1 8.45 5.75c-2.2 4.7-9.4 9.05-9.4 9.05Z" />
  </svg>
);

export const Reply = make(
  <>
    <path d="M21 11.5a8.4 8.4 0 0 1-3.84 7.06A8.5 8.5 0 0 1 12.5 20a8.6 8.6 0 0 1-3.5-.74L3 20.5l1.34-5.06A8.5 8.5 0 1 1 21 11.5Z" />
    <circle cx="8.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
  </>
);

export const Share = make(
  <>
    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="m16 6-4-4-4 4" />
    <path d="M12 2v14" />
  </>
);

export const Pencil = make(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </>
);

export const Trash = make(
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </>
);

export const Plus = make(<path d="M12 5v14M5 12h14" />);

export const Chevron = make(<path d="m6 9 6 6 6-6" />);

export const ArrowLeft = make(
  <>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </>
);
