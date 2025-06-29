import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = 'px-6 py-3 rounded-2xl font-bold transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg';
  const primaryStyle = 'bg-primary text-white shadow-md hover:bg-primary-dark';
  const secondaryStyle = 'bg-secondary text-white shadow-md hover:bg-secondary-dark';
  const outlineStyle = 'border-2 border-primary text-primary hover:bg-primary-light hover:text-white';

  let variantStyle;
  switch (variant) {
    case 'primary':
      variantStyle = primaryStyle;
      break;
    case 'secondary':
      variantStyle = secondaryStyle;
      break;
    case 'outline':
      variantStyle = outlineStyle;
      break;
    default:
      variantStyle = primaryStyle;
  }

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
