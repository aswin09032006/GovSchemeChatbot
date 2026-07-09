import React from 'react';

const CopilotLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F25022" />
    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#FFB900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22V12" stroke="#00A4EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CopilotLogo;
