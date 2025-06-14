import React, { useEffect, useState } from "react";
import Select from "react-select";

const SearchableDrop = (props) => {
  const {
    value,
    handleChange,
    data,
    label,
    formError,
    className,
    width,
    sampleRef,
  } = props;
  const [options, setOptions] = useState([]);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "auto",
      height: "30px",
      padding: "0",
      borderRadius: "0",
      borderColor: state.isFocused || state.isActive ? "#9e444b" : "#ccc",
      borderWidth: state.isFocused ? "2px" : "1px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9e444b",
      },

      fontSize: "14px",
      width: `${width || 200}px`,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    menu: (base) => ({
      ...base,
      marginTop: 2,
      borderRadius: 0,
      boxShadow: "none",
      border: "1px solid #ccc",
    }),
    option: (base, state) => ({
      ...base,
      padding: "4px 8px",
      backgroundColor: state.isFocused ? "#eee" : "#fff",
      color: "#000",
      cursor: "default",
    }),
  };

  useEffect(() => {
    let updatedData = data.map((ele) => {
      return {
        label:
          ele.unitName ||
          ele.sampleName ||
          ele.propertyName ||
          ele.companyName ||
          ele.location ||
          ele.name,
        value: ele._id,
      };
    });

    setOptions(updatedData);
  }, [data]);

  return (
    <div>
      {label && <label className="mb-2">{label}</label>}
      <Select
        value={value}
        onChange={handleChange}
        options={options}
        className={className}
        styles={customStyles}
        ref={sampleRef}
      />

      {formError && <span className="text-error">{formError}</span>}
    </div>
  );
};

export default SearchableDrop;
