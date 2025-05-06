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
    width,
    key,
  } = props;

  return (
    <div>
      <div className="mb-3">
        {label && <label className="mb-2">{label}</label>}
      </div>
      <div className="mb-3">
        <input
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          className={`form-control ${className ? className : ""}`}
          type={type ? type : "text"}
          style={{ width: `${width}px` }}
          key={key}
        />
      </div>
      {formError && <span className="text-error">{formError}</span>}
    </div>
  );
};

export default TextBox;
