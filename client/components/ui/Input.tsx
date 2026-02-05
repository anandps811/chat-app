import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <label className="flex flex-col">
      {label && <span className="text-white font-serif text-lg font-medium leading-normal pb-3">{label}</span>}
      <input
        className={`flex w-full min-w-0 flex-1 rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/40 border border-slate-700 bg-slate-900/50 focus:border-primary h-14 placeholder:text-slate-600 p-[15px] text-base font-normal leading-normal transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-red-400 text-sm pt-2">{error}</span>}
    </label>
  );
};

export default Input;
