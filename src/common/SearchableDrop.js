import React, { useEffect, useState } from "react";
import Select from "react-select";

const SearchableDrop = (props) => {
  const { value, handleChange, data, label, formError } = props;
  const [options, setOptions] = useState([]);

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
      <Select value={value} onChange={handleChange} options={options} />

      {formError && <span className="text-error">{formError}</span>}
    </div>
  );
};

export default SearchableDrop;
