import React from "react";
import { Button } from "react-bootstrap";

const CustomButton = (props) => {
  const { onClick, label, className, children, variant } = props;

  return (
    <Button onClick={onClick} className={`btn ${className}`} variant={variant}>
      {label || children}
    </Button>
  );
};

export default CustomButton;
