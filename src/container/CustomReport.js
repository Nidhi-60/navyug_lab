import React, { useCallback, useEffect, useRef, useState } from "react";
import SearchableDrop from "../common/SearchableDrop";
import DateComponent from "../common/Date";
import { ipcRenderer } from "electron";
import moment from "moment";
import CustomButton from "../common/Button";
import CustomReportPrint from "../component/CustomReportPrint";
import ComponentToPrint from "../component/ComponentToPrint";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import PrintBlock from "./PrintBlock";

const CustomReport = () => {
  let currentDate = new Date();
  let prevMonthDate = new Date();
  prevMonthDate.setMonth(currentDate.getMonth() - 1);
  const [filterData, setFilterData] = useState({
    fromDate: prevMonthDate,
    toDate: currentDate,
    sampleName: "",
    partyName: "",
    testName: "",
    account: { label: "Y", value: "Y" },
  });
  const [sampleOptions, setSampleOptions] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [searchPropertyList, setSearchPropertyList] = useState([]);
  const componentRef = useRef(null);

  useEffect(() => {
    ipcRenderer.send("sampleSearch:load");

    ipcRenderer.once("sampleSearch:success", (e, data) => {
      setSampleOptions(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    ipcRenderer.send("accountSearchParty:load", filterData?.account?.value);

    ipcRenderer.once("accountSearchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, [filterData.account.value]);

  useEffect(() => {
    refetchProperty();
  }, []);

  const refetchProperty = () => {
    ipcRenderer.send("sampleSearchProperty:load");

    ipcRenderer.once("sampleSearchProperty:success", (e, data) => {
      setSearchPropertyList(JSON.parse(data));
    });
  };

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
      // handlePrint();
      ipcRenderer.send("print", componentRef.current.innerHTML);
    }
  }, [reportData]);

  const accountDrop = [
    { _id: "N", name: "N" },
    { _id: "Y", name: "Y" },
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
      testName: filterData.testName.value,
    };

    ipcRenderer.send("loadReport:load", updatedFilter);

    ipcRenderer.once("loadReport:success", (e, data) => {
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
        toast.error("No data found.");
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
      <div className="">
        <div className="d-flex justify-content-center mb-3">
          <div className="col-6 mr-5">
            <SearchableDrop
              label="Sample Name"
              data={sampleOptions}
              handleChange={(e) => handleDropChange(e, "sampleName")}
              value={filterData.sampleName}
            />
          </div>
          <div className="col-6 mr-5">
            <SearchableDrop
              label="Party Name"
              data={partyList}
              handleChange={(e) => handleDropChange(e, "partyName")}
              value={filterData.partyName}
            />
          </div>
          <div className="col-6 mr-5">
            <SearchableDrop
              label="Account"
              data={accountDrop}
              handleChange={(e) => handleDropChange(e, "account")}
              value={filterData.account}
            />
          </div>
          <div className="col-6 mr-5">
            <SearchableDrop
              label="Test Name"
              data={searchPropertyList}
              value={filterData.testName}
              handleChange={(e) => handleDropChange(e, "testName")}
            />
          </div>
        </div>
        <div className="d-flex justify-content-center mb-5">
          <div className="col-6 mr-5">
            <DateComponent
              label="From Date"
              name="fromDate"
              value={moment(filterData.fromDate).format("YYYY-MM-DD")}
              onChange={handleTextChange}
              width="200"
            />
          </div>
          <div className="col-6">
            <DateComponent
              label="To Date"
              name="toDate"
              value={moment(filterData.toDate).format("YYYY-MM-DD")}
              onChange={handleTextChange}
              width="200"
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-2">
        <div className="col-3">
          <CustomButton onClick={handleLoadReport} className="mr-5 btn-primary">
            Load Report
          </CustomButton>
          <CustomButton onClick={handleClearReport} className="btn-secondary">
            Reset
          </CustomButton>
        </div>
      </div>

      {/* <CustomReportPrint report={reportData} /> */}
      {/* {reportData.length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <CustomReportPrint report={reportData} />
        </ComponentToPrint>
      )} */}

      {reportData.length > 0 && (
        <PrintBlock componentRef={componentRef}>
          <CustomReportPrint report={reportData} />
        </PrintBlock>
      )}
    </>
  );
};

export default CustomReport;
