import React from "react";

const DateComponent = (props) => {
  const { name, value, onChange, label } = props;

  return (
    <>
      {label && <label className="mb-2">{label}</label>}
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="form-control"
      />
    </>
  );
};

export default DateComponent;
