import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  href?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-semibold';
  const primaryStyle = 'bg-blue-500 text-white hover:bg-blue-600';
  const outlineStyle = 'border border-blue-500 text-blue-500 hover:bg-blue-50';

  const variantStyle = variant === 'primary' ? primaryStyle : outlineStyle;

  if (props.href) {
    return (
      <a
        href={props.href}
        className={`${baseStyle} ${variantStyle} ${className || ''}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
