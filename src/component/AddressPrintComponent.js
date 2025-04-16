import React from "react";

const AddressPrintComponent = (props) => {
  const { addressData } = props;

  return (
    <>
      <div>{addressData.address}</div>
    </>
  );
};

export default AddressPrintComponent;
