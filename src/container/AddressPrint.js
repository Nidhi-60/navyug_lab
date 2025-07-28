import React, { useEffect, useRef, useState } from "react";
import SearchableDrop from "../common/SearchableDrop";
import { ipcRenderer } from "electron";
import CustomButton from "../common/Button";
import AddressPrintComponent from "../component/AddressPrintComponent";
import ComponentToPrint from "../component/ComponentToPrint";

const AddressPrint = () => {
  const [company, setCompany] = useState("");
  const [partyList, setPartyList] = useState([]);
  const [address, setAddress] = useState({});
  const componentRef = useRef(null);

  const fetchAddress = () => {};

  const fetchCompanies = () => {
    ipcRenderer.send("searchParty:load");

    ipcRenderer.once("searchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDropChange = (e) => {
    setCompany(e);
  };

  const handleApplyFilter = () => {
    ipcRenderer.send("companySearch:load", company.value);

    ipcRenderer.once("companySearch:success", (e, data) => {
      let addressDetail = JSON.parse(data);

      setAddress(addressDetail[0]);
    });
  };

  useEffect(() => {
    if (Object.keys(address).length > 0) {
      // handlePrint();
      ipcRenderer.send("print", componentRef.current.innerHTML);
      setAddress({});
    }
  }, [address]);

  return (
    <>
      <div>
        <div className="row mb-5">
          <div className="col-6">
            <SearchableDrop
              label="Party Name"
              data={partyList}
              value={company}
              name="company"
              handleChange={(e) => handleDropChange(e)}
            />
          </div>
        </div>

        <div className="row text-center">
          <div className="col-12">
            <CustomButton
              onClick={handleApplyFilter}
              className="btn btn-primary"
            >
              Load Address
            </CustomButton>
          </div>
        </div>
      </div>

      {Object.keys(address).length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <AddressPrintComponent addressData={address} />
        </ComponentToPrint>
      )}
    </>
  );
};

export default AddressPrint;
