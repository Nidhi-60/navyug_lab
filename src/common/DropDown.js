import React from "react";
const DropDown = (props) => {
  const { data, onChange, name, value, label } = props;

  return (
    <>
      {label && <label>{label}</label>}
      <select
        className="form-select"
        aria-label="Default select example"
        onChange={onChange}
        name={name}
        value={value}
      >
        <option>Select here</option>
        {data?.map((ele) => {
          return (
            <option key={ele._id} value={ele._id}>
              {ele.label}
            </option>
          );
        })}
      </select>
    </>
  );
};

export default DropDown;
