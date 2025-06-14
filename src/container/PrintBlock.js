import React from "react";

const PrintBlock = (props) => {
  const { children, componentRef } = props;

  return (
    <>
      <div ref={componentRef} className="printContent">
        {children}
      </div>
    </>
  );
};

export default PrintBlock;
