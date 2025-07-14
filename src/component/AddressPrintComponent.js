import React from "react";

const AddressPrintComponent = (props) => {
  const { addressData } = props;

  let nameStyle = {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#000000",
  };

  return (
    <>
      <div style={{ marginTop: "10px", position: "absolute", left: "30%" }}>
        <div>
          <span style={nameStyle}>{addressData.companyName}</span>
        </div>
        <div>
          <span style={nameStyle}>{addressData.address}</span>
        </div>
      </div>
    </>
  );
};

export default AddressPrintComponent;
