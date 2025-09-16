import React from "react";

const Loader = ({ size = 48, text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <svg
      className="animate-spin text-primary mb-2"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span className="text-muted-foreground text-base font-medium">{text}</span>
  </div>
);

export default Loader;
