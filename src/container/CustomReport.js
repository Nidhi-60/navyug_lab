import React, { useCallback, useEffect, useRef, useState } from "react";
import SearchableDrop from "../common/SearchableDrop";
import DateComponent from "../common/Date";
import { ipcRenderer } from "electron";
import moment from "moment";
import CustomButton from "../common/Button";
import CustomReportPrint from "../component/CustomReportPrint";
import ComponentToPrint from "../component/ComponentToPrint";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";

const CustomReport = () => {
  let currentDate = new Date();
  let prevMonthDate = new Date();
  prevMonthDate.setMonth(currentDate.getMonth() - 1);
  const [filterData, setFilterData] = useState({
    fromDate: prevMonthDate,
    toDate: currentDate,
    sampleName: "",
    partyName: "",
    account: "",
  });
  const [sampleOptions, setSampleOptions] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const componentRef = useRef(null);

  useEffect(() => {
    ipcRenderer.send("sampleSearch:load");

    ipcRenderer.on("sampleSearch:success", (e, data) => {
      setSampleOptions(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    ipcRenderer.send("searchParty:load");

    ipcRenderer.on("searchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, []);

  const handleAfterPrint = useCallback(() => {
    console.log("`onAfterPrint` called");
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

  const accountDrop = [
    { _id: "no", name: "No" },
    { _id: "yes", name: "Account" },
  ];

  const handleTextChange = (e) => {
    setFilterData({ ...filterData, [e.target.name]: e.target.value });
  };

  const handleDropChange = (e, name) => {
    setFilterData({ ...filterData, [name]: e });
  };

  const handleLoadReport = () => {
    let updatedFilter = {
      fromDate: filterData.fromDate,
      toDate: filterData.toDate,
      sampleName: filterData.sampleName.value,
      partyName: filterData.partyName.value,
      account: filterData.account.value,
    };

    console.log(updatedFilter);

    ipcRenderer.send("loadReport:load", updatedFilter);

    ipcRenderer.on("loadReport:success", (e, data) => {
      let res = JSON.parse(data);
      setFilterData({
        fromDate: prevMonthDate,
        toDate: currentDate,
        sampleName: "",
        partyName: "",
        account: "",
      });
      if (res.length > 0) {
        setReportData(JSON.parse(data));
      } else {
        toast.warn("No data found.");
      }
    });
  };

  const handleClearReport = () => {
    setReportData([]);
    setFilterData({
      fromDate: prevMonthDate,
      toDate: currentDate,
      sampleName: "",
      partyName: "",
      account: "",
    });
  };

  return (
    <>
      <div className="row mb-3">
        <div className="col-6 mb-2">
          <SearchableDrop
            label="Sample Name"
            data={sampleOptions}
            handleChange={(e) => handleDropChange(e, "sampleName")}
            value={filterData.sampleName}
          />
        </div>
        <div className="col-6 mb-2">
          <SearchableDrop
            label="Party Name"
            data={partyList}
            handleChange={(e) => handleDropChange(e, "partyName")}
            value={filterData.partyName}
          />
        </div>
        <div className="col-6 mb-2">
          <SearchableDrop
            label="Account"
            data={accountDrop}
            handleChange={(e) => handleDropChange(e, "account")}
            value={filterData.account}
          />
        </div>
        <div className="col-6 mb-2">
          <DateComponent
            label="From Date"
            name="fromDate"
            value={moment(filterData.fromDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
          />
        </div>
        <div className="col-6 mb-2">
          <DateComponent
            label="To Date"
            name="toDate"
            value={moment(filterData.toDate).format("YYYY-MM-DD")}
            onChange={handleTextChange}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-3">
          <CustomButton onClick={handleLoadReport} className="me-2">
            Load Report
          </CustomButton>
          <CustomButton onClick={handleClearReport} className="btn-secondary">
            Reset
          </CustomButton>
        </div>
      </div>

      {/* <CustomReportPrint report={reportData} /> */}
      {reportData.length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <CustomReportPrint report={reportData} />
        </ComponentToPrint>
      )}
    </>
  );
};

export default CustomReport;
