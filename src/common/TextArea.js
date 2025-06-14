import React from "react";

const TextArea = (props) => {
  const { value, onChange, name, width } = props;

  return (
    <textarea
      name={name}
      onChange={onChange}
      value={value || ""}
      className="form-control"
      style={{ width: `${width}px` }}
    />
  );
};

export default TextArea;
