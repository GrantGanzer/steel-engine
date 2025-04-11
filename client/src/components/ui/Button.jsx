
import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    className="bg-spydercoRed hover:bg-red-700 text-white font-bold py-2 px-4 rounded uppercase tracking-wide transition-all border border-white/30"
    {...props}
    {...props}
  >
    {children}
  </button>
);
export default Button;
