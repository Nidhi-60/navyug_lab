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

const BillShow = () => {
  let currentDate = new Date();
  let prevMonthDate = new Date();
  prevMonthDate.setMonth(currentDate.getMonth() - 1);
  const [filterData, setFilterData] = useState({
    partyName: "",
    billNo: "",
    accountType: "",
    fromDate: prevMonthDate,
    toDate: currentDate,
  });
  const [partyList, setPartyList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const componentRef = useRef(null);

  useEffect(() => {
    ipcRenderer.send("searchParty:load");

    ipcRenderer.on("searchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, []);

  const accountDrop = [
    { _id: "no", name: "No" },
    { _id: "account", name: "Account" },
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
      setReportData(JSON.parse(data));
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

  useEffect(() => {
    if (reportData.length > 0) {
      handlePrint();
    }
  }, [reportData]);

  return (
    <div>
      <div className="row mb-2">
        <div className="col-6">
          <SearchableDrop
            label="Party Name"
            data={partyList}
            value={filterData.partyName}
            name="partyName"
            handleChange={(e) => handleDropChange(e, "partyName")}
          />
        </div>
        <div className="col-6">
          <TextBox
            label="Bill No"
            name="billNo"
            value={filterData.billNo}
            onChange={handleTextChange}
          />
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-6">
          <DateComponent
            label="From Date"
            name="fromDate"
            value={moment(filterData.fromDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
          />
        </div>
        <div className="col-6">
          <DateComponent
            label="To Date"
            name="toDate"
            value={moment(filterData.toDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
          />
        </div>
      </div>
      <div className="row mb-2">
        <div className="col-6">
          <SearchableDrop
            label="Account"
            name="accountType"
            data={accountDrop}
            value={filterData.accountType}
            handleChange={(e) => handleDropChange(e, "accountType")}
          />
        </div>
      </div>
      <div className="row text-center">
        <div className="col-12">
          <CustomButton onClick={handleApplyFilter}>Load Report</CustomButton>
        </div>
      </div>

      {/* {reportData.length > 0 && (
        <BillShowPrint reportData={reportData} filterData={filterData} />
      )} */}

      {reportData.length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <BillShowPrint reportData={reportData} filterData={filterData} />
        </ComponentToPrint>
      )}
    </div>
  );
};

export default BillShow;
