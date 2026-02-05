import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const base = 'w-full h-14 rounded-lg font-display font-bold text-lg transition-all';
  const styles =
    variant === 'primary'
      ? 'bg-primary text-white hover:brightness-110 active:scale-[0.98]'
      : 'bg-transparent text-primary hover:underline';

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
