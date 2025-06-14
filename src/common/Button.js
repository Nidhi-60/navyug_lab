import React from "react";

const CustomButton = (props) => {
  const { onClick, label, className, children, variant } = props;

  return (
    <button onClick={onClick} className={`btn ${className}`} variant={variant}>
      {label || children}
    </button>
  );
};

export default CustomButton;
