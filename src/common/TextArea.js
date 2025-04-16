import React from "react";

const TextArea = (props) => {
  const { value, onChange, name } = props;

  return (
    <textarea
      name={name}
      onChange={onChange}
      value={value}
      className="form-control"
    />
  );
};

export default TextArea;
