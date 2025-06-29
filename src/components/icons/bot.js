import React from 'react';

const IconBot = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width="100%"
    height="100%">
    <title>Bot</title>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <text 
      x="7.5" 
      y="18" 
      fill="currentColor" 
      fontSize="5"
      fontFamily="var(--font-mono)" 
      fontWeight="bold">
      VP
    </text>
  </svg>
);

export default IconBot;