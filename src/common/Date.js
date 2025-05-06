import React from "react";

const DateComponent = (props) => {
  const { name, value, onChange, label, width } = props;

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
        />
      </div>
    </>
  );
};

export default DateComponent;
