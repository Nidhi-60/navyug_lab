import React from "react";

const DateComponent = (props) => {
  const { name, value, onChange, label, width, min, max } = props;

  return (
    <>
      <div>{label && <label className="mb-2">{label}</label>}</div>
      <div>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="form-control"
          style={{ width: `${width}px` }}
          min={min}
          max={max}
        />
      </div>
    </>
  );
};

export default DateComponent;
