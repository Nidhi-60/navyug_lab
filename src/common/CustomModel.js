import React from "react";

import CustomButton from "./Button";

const CustomModel = (props) => {
  const { show, handleClose, title, message, children, button } = props;

  return (
    <>
      <div className={show ? "backdrop" : ""} onClick={handleClose}></div>
      <dialog open={show}>
        <div>
          <p>{title}</p>
        </div>
        <div className="mb-5">{message || children}</div>
        <div>
          {button.map((ele, index) => {
            return (
              <CustomButton
                label={ele.label}
                onClick={ele.action}
                key={index}
                className={ele.className}
              ></CustomButton>
            );
          })}
        </div>
      </dialog>
    </>
  );
};

export default CustomModel;
