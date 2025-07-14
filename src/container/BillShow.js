import React, { useCallback, useEffect, useRef, useState } from "react";
import SearchableDrop from "../common/SearchableDrop";
import { ipcRenderer } from "electron";
import TextBox from "../common/TextBox";
import DateComponent from "../common/Date";
import CustomButton from "../common/Button";
import moment from "moment";
import BillShowPrint from "../component/BillShowPrint";
import { useReactToPrint } from "react-to-print";
import ComponentToPrint from "../component/ComponentToPrint";
import PrintBlock from "./PrintBlock";
import ReactSwitch from "react-switch";
import toast from "react-hot-toast";

const BillShow = () => {
  let currentDate = new Date();
  let prevMonthDate = new Date();
  prevMonthDate.setMonth(currentDate.getMonth() - 1);
  const [filterData, setFilterData] = useState({
    partyName: "",
    billNo: "",
    accountType: { label: "Y", value: "Y" },
    fromDate: prevMonthDate,
    toDate: currentDate,
  });
  const [partyList, setPartyList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const componentRef = useRef(null);
  const [switchData, setSwitchData] = useState(false);

  // useEffect(() => {
  //   ipcRenderer.send("searchParty:load");

  //   ipcRenderer.on("searchParty:success", (e, data) => {
  //     setPartyList(JSON.parse(data));
  //   });
  // }, []);

  useEffect(() => {
    ipcRenderer.send("accountSearchParty:load", filterData?.accountType?.value);

    ipcRenderer.on("accountSearchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, [filterData.accountType.value]);

  const accountDrop = [
    { _id: "N", name: "N" },
    { _id: "Y", name: "Y" },
  ];

  const handleApplyFilter = () => {
    let updatedFilterData = {
      partyName: filterData?.partyName?.value || "",
      billNo: filterData?.billNo,
      accountType: filterData?.accountType?.value || "",
      fromDate: filterData?.fromDate,
      toDate: filterData?.toDate,
    };

    ipcRenderer.send("report:load", updatedFilterData);

    ipcRenderer.on("report:success", (e, data) => {
      let parsedData = JSON.parse(data);

      if (parsedData.length > 0) {
        setReportData(JSON.parse(data));
      } else {
        toast.error("No Data Found");
      }
    });
  };

  const handleTextChange = (e) => {
    setFilterData({
      ...filterData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDropChange = (e, name) => {
    setFilterData({
      ...filterData,
      [name]: e,
    });
  };

  const handleAfterPrint = useCallback(() => {
    console.log("`onAfterPrint` called");
    setFilterData({
      ...filterData,
      partyName: "",
      billNo: "",
      accountType: "",
      fromDate: prevMonthDate,
      toDate: currentDate,
    });
  }, []);

  const handleBeforePrint = useCallback(() => {
    console.log("`onBeforePrint` called");
    return Promise.resolve();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "AwesomeFileName",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  const handleClearReport = () => {
    setReportData([]);
    setFilterData({
      partyName: "",
      billNo: "",
      accountType: { label: "Y", value: "Y" },
      fromDate: prevMonthDate,
      toDate: currentDate,
    });
  };

  useEffect(() => {
    if (reportData.length > 0) {
      // handlePrint();
      ipcRenderer.send("print", componentRef.current.innerHTML);
    }
  }, [reportData]);

  const handleSwitchChange = (e) => {
    setSwitchData(e);
  };

  return (
    <div>
      <div className="row mb-2  d-flex justify-content-center mb-3">
        <div className="col-6 mr-5">
          <SearchableDrop
            label="Party Name"
            data={partyList}
            value={filterData.partyName}
            name="partyName"
            handleChange={(e) => handleDropChange(e, "partyName")}
          />
        </div>
        <div className="col-6  mr-5">
          <TextBox
            label="Bill No"
            name="billNo"
            value={filterData.billNo}
            onChange={handleTextChange}
            width="200"
          />
        </div>
        <div className="col-6  mr-5">
          <SearchableDrop
            label="Account"
            name="accountType"
            data={accountDrop}
            value={filterData.accountType}
            handleChange={(e) => handleDropChange(e, "accountType")}
          />
        </div>
      </div>

      <div className="row mb-2 d-flex justify-content-center mb-3">
        <div className="col-6 mr-5">
          <DateComponent
            label="From Date"
            name="fromDate"
            value={moment(filterData.fromDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
            width="200"
          />
        </div>
        <div className="col-6 mr-5">
          <DateComponent
            label="To Date"
            name="toDate"
            value={moment(filterData.toDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
            width="200"
          />
        </div>

        <div className="d-flex align-items-center">
          <label>Is GST : </label>
          <ReactSwitch onChange={handleSwitchChange} checked={switchData} />
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <div className="col-12">
          <CustomButton
            onClick={handleApplyFilter}
            className="btn-primary mr-5"
          >
            Load Report
          </CustomButton>
          <CustomButton onClick={handleClearReport} className="btn-secondary">
            Reset
          </CustomButton>
        </div>
      </div>

      {/* {reportData.length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <BillShowPrint reportData={reportData} filterData={filterData} />
        </ComponentToPrint>
      )} */}

      {reportData.length > 0 && (
        <PrintBlock componentRef={componentRef}>
          <BillShowPrint
            reportData={reportData}
            filterData={filterData}
            switchData={switchData}
          />
        </PrintBlock>
      )}
    </div>
  );
};

export default BillShow;
