import React from "react";
import { Modal } from "react-bootstrap";
import CustomButton from "./Button";

const CustomModel = (props) => {
  const { show, handleClose, title, message, children, button } = props;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message || children}</Modal.Body>
      <Modal.Footer>
        {button.map((ele, index) => {
          return (
            <CustomButton
              label={ele.label}
              onClick={ele.action}
              key={index}
            ></CustomButton>
          );
        })}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModel;
