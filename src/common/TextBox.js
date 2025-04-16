import React from "react";

const TextBox = (props) => {
  const {
    value,
    onChange,
    name,
    type,
    label,
    handleOnBlur,
    handleOnFocus,
    formError,
    className,
  } = props;
  return (
    <>
      {label && <label className="mb-2">{label}</label>}
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        className={`form-control ${className ? className : ""}`}
        type={type ? type : "text"}
      />

      {formError && <span className="text-error">{formError}</span>}
    </>
  );
};

export default TextBox;
