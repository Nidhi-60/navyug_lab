import React, { useCallback, useEffect, useRef, useState } from "react";
import TextBox from "../common/TextBox";
import DateComponent from "../common/Date";
import SearchableDrop from "../common/SearchableDrop";
import moment from "moment";
import { ipcRenderer } from "electron";
import CustomButton from "../common/Button";
import TransactionBillTable from "../component/TransactionBillTable";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import ComponentToPrint from "../component/ComponentToPrint";
import AnalysisCertificate from "../component/AnalysisCertificate";
import { transactionValidation } from "../validation/transaction";
import { ICONS } from "../constant/icons";
import DropDown from "../common/DropDown";
import AccountSummary from "../component/AccountSummary";

const SampleTransaction = () => {
  const [transactionData, setTransactionData] = useState({
    billNo: "",
    date: moment(new Date()).format("YYYY-MM-DD"),
    sampleId: "",
    locationId: "",
    partyId: "",
    properties: [],
  });
  const [newTransaction, setNewTransaction] = useState({
    pid: "",
    remark: "",
    price: "",
    paid: false,
  });
  const [sampleList, setSampleList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [location, setLocation] = useState([]);

  const [billData, setBillData] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date());
  const componentRef = useRef(null);
  const [billPdfData, setBillPdfData] = useState({});
  const [result, setResult] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState({
    billNo: "",
    propertiesId: "",
  });
  const [formError, setFormError] = useState({});

  useEffect(() => {
    fetchBill();
  }, [dateFilter]);

  useEffect(() => {
    fetchMonthBill();
  }, [transactionData.date]);

  const fetchBill = () => {
    ipcRenderer.send("transactionList:load", dateFilter);

    ipcRenderer.on("transactionList:success", (e, data) => {
      let parsedData = JSON.parse(data);

      const updatedData = mergeProperties(parsedData);
      console.log(JSON.parse(JSON.stringify(updatedData, null, 2)));

      setBillData(JSON.parse(data));
    });
  };

  function mergeProperties(data) {
    data.forEach((bill) => {
      const mergedProperties = {};

      // Loop through each property in the bill
      bill.properties.forEach((property) => {
        const key = `${property.pid}-${property.propertyName}`;

        // If the property has already been processed, merge the prices
        if (mergedProperties[key]) {
          mergedProperties[key].price = (
            parseFloat(mergedProperties[key].price) + parseFloat(property.price)
          ).toString();
          mergedProperties[key].result += `, ${property.result}`;
          // Keep the remark from the first occurrence
          if (!mergedProperties[key].remark)
            mergedProperties[key].remark = property.remark;
        } else {
          // Otherwise, add the property to mergedProperties object
          mergedProperties[key] = { ...property };
        }
      });

      // Set the merged properties back into the bill
      bill.properties = Object.values(mergedProperties);
    });
    return data;
  }

  const fetchMonthBill = () => {
    ipcRenderer.send("billCount:load", transactionData.date);

    ipcRenderer.on("billCount:success", (e, data) => {
      let res = JSON.parse(data);

      ipcRenderer.send("location:load");

      ipcRenderer.on("location:success", async (e, data) => {
        let locationsData = JSON.parse(data);

        setLocation(locationsData);

        let findLocation = locationsData.find((ele) => ele.isDefault);

        setTransactionData({
          date: moment(transactionData.date).format("YYYY-MM-DD"),
          sampleId: "",
          locationId: { label: findLocation.location, value: findLocation._id },
          partyId: "",
          properties: [],
          billNo: parseInt(res.total_records) + 1,
        });
      });
    });
  };

  useEffect(() => {
    ipcRenderer.send("sampleSearch:load");

    ipcRenderer.on("sampleSearch:success", (e, data) => {
      setSampleList(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    ipcRenderer.send("searchParty:load");

    ipcRenderer.on("searchParty:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    if (transactionData?.sampleId?.value) {
      ipcRenderer.send(
        "getSampleProperty:load",
        transactionData.sampleId.value
      );

      ipcRenderer.on("getSampleProperty:success", (e, data) => {
        let parsedData = JSON.parse(data);

        setPropertyList(parsedData);

        let defaultProperty = parsedData.filter((ele) => ele.isDefault);

        let defaultPropertyData = defaultProperty.map((ele) => {
          return {
            account: "",
            pid: { label: ele.propertyName, value: ele.propertyId },
            remark: "",
            unit: ele.punit,
            paid: false,
            price: ele.pprice,
          };
        });

        setTransactionData({
          ...transactionData,
          properties: defaultPropertyData,
        });

        let total = defaultPropertyData.reduce((acc, curr) => {
          return acc + parseInt(curr.price);
        }, 0);

        setTotalPrice(total);
      });
    }
  }, [transactionData.sampleId.value]);

  const header = [
    "Print",
    "SampleName",
    "CompanyName",
    "AC",
    "Location",
    "TestName",
    "Test Result",
    "Remark",
    "Paid",
    "Amount",
    "Test Date",
  ];

  const handlePreviousDate = () => {
    const currentDate = dateFilter;
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);

    setDateFilter(previousDate);
  };

  const handleNextDate = () => {
    const currentDate = dateFilter;

    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    setDateFilter(nextDate);
  };

  const handleDateChange = (e) => {
    setDateFilter(new Date(e.target.value));
  };

  const handleTextChange = (e) => {
    setFormError({ ...formError, [e.target.name]: "" });
    setTransactionData({
      ...transactionData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (transactionData.partyId) {
      setTransactionData({
        ...transactionData,
        properties: transactionData.properties.map((ele) => {
          return {
            ...ele,
            paid: false,
          };
        }),
      });
    }
  }, [transactionData.partyId]);

  const handleSearchDropChange = (e, name) => {
    setFormError({ ...formError, [name]: "" });
    if (name === "sampleName") {
      setTransactionData({
        ...transactionData,
        [name]: e,
        properties: [],
      });
    } else {
      setTransactionData({
        ...transactionData,
        [name]: e,
      });
    }
  };

  const handleSaveBill = () => {
    const { formError, formValid } = transactionValidation(transactionData);

    if (formValid) {
      let updatedObj = {
        billNo: transactionData.billNo,
        createdAt: transactionData.date,
        sampleId: transactionData.sampleId.value,
        partyId: transactionData.partyId.value,
        locationId: transactionData.locationId.value,
        propertyList: transactionData.properties.map((ele) => {
          return {
            pid: ele.pid.value,
            price: ele.price,
            remark: ele.remark,
            unit: ele.unit,
            paid: ele.paid || false,
          };
        }), // propertyList,
      };

      ipcRenderer.send("addBill:load", updatedObj);
      ipcRenderer.on("addBill:success", (e, data) => {
        console.log("data after save", data);
        console.log("e", e);

        toast.success("Bill Added Successfully.");
        fetchBill();
        setTotalPrice(0);
        fetchMonthBill();
      });
    } else {
      setFormError(formError);
    }
  };

  const handleAfterPrint = useCallback(() => {
    console.log("`onAfterPrint` called");
    setBillPdfData({});
  }, []);

  const handleBeforePrint = useCallback(() => {
    console.log("`onBeforePrint` called");
    return Promise.resolve();
  }, []);

  const handleId = (e, id) => {
    let findData = billData.find((ele) => ele.transactionId === id);

    setBillPdfData(findData);
  };

  useEffect(() => {
    if (Object.keys(billPdfData).length > 0) {
      handlePrint();
    }
  }, [billPdfData]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "AwesomeFileName",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  const handleTestResult = (e, data, propertyId, transactionProperyId) => {
    setResult({
      ...result,
      billId: data.transactionId,
      propertyId: propertyId,
      result: e.target.value,
      transactionProperyId: transactionProperyId,
    });
  };

  const handleSaveResult = () => {
    if (editMode) {
      ipcRenderer.send("updateResult:load", {
        ...result,
        createdAt: moment(new Date()).format("YYYY-MM-DD"),
      });
      ipcRenderer.on("updateResult:success", (e, data) => {
        setResult({});
        fetchBill();
        setEditMode(false);
      });
    } else {
      ipcRenderer.send("saveTestResult:load", {
        ...result,
        createdAt: moment(new Date()).format("YYYY-MM-DD"),
      });
      ipcRenderer.on("saveTestResult:success", (e, data) => {
        setResult({});
        fetchBill();
        setEditMode(false);
      });
    }
  };

  const handleTextBoxOnFocus = (e, value, billId, propertyId, resultId) => {
    if (resultId) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }

    setCurrent({
      billId: billId,
      propertyId: propertyId,
    });
    setResult({
      ...result,
      result: value,
      resultId: resultId,
    });
  };

  const handleCancel = () => {
    setTransactionData({
      billNo: "",
      date: moment(new Date()).format("YYYY-MM-DD"),
      sampleId: "",
      locationId: "",
      partyId: "",
    });
  };

  const handleRemark = (e, index) => {
    setTransactionData({
      ...transactionData,
      properties: transactionData.properties.map((ele, eleIndex) => {
        if (eleIndex === index) {
          return {
            ...ele,
            remark: e.target.value,
          };
        } else {
          return ele;
        }
      }),
    });
  };

  // const handlePaid = (e, index) => {
  //   setTransactionData({
  //     ...transactionData,
  //     properties: transactionData.properties.map((ele, eleIndex) => {
  //       if (eleIndex === index) {
  //         return {
  //           ...ele,
  //           paid: e.target.value,
  //         };
  //       } else {
  //         return ele;
  //       }
  //     }),
  //   });
  // };

  const handlePropertyDropChange = (e, index) => {
    let p = propertyList.find((ele) => e.value === ele._id);

    setTransactionData({
      ...transactionData,
      properties: transactionData.properties.map((ele, eleIndex) => {
        if (eleIndex === index) {
          return {
            ...ele,
            pid: e,
            price: p.pprice,
            unit: p.punit,
          };
        } else {
          return ele;
        }
      }),
    });
  };

  const handleNewPropertyChange = (e) => {
    let p = propertyList.find((ele) => e.value === ele._id);

    setNewTransaction({
      ...newTransaction,
      pid: { label: e.label, value: p.propertyId },
      price: p.pprice,
    });
  };

  const handleNewPropertyRemark = (e) => {
    setNewTransaction({
      ...newTransaction,
      remark: e.target.value,
    });
  };

  const handleAddProperty = () => {
    // setTransactionData({
    //   ...transactionData,
    //   properties: [
    //     ...transactionData.properties,
    //     { pid: "", price: "", unit: "", remark: "" },
    //   ],
    // });

    setTransactionData({
      ...transactionData,
      properties: [...transactionData.properties, newTransaction],
    });

    setTotalPrice(totalPrice + parseInt(newTransaction.price));

    setNewTransaction({
      pid: "",
      price: "",
      remark: "",
    });
  };

  useEffect(() => {
    if (transactionData.partyId) {
      getPartyAccount();
    }
  }, [transactionData.partyId]);

  const getPartyAccount = () => {
    let accountData = partyList.find(
      (ele) => ele._id === transactionData.partyId.value
    );

    return accountData;
  };

  const handlePaid = (e, data, key) => {
    if (key === "transaction") {
      setTransactionData({
        ...transactionData,
        properties: transactionData.properties.map((ele) => {
          return {
            ...ele,
            paid: e.target.checked,
          };
        }),
      });
    } else {
      setNewTransaction({
        ...newTransaction,
        paid: e.target.checked,
      });
    }
  };

  return (
    <div className="row">
      {Object.keys(billPdfData).length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <AnalysisCertificate printData={billPdfData} />
        </ComponentToPrint>
      )}

      <div className="col-5">
        <div className="">
          <div className="row mb-2">
            <div className="col-2">
              <TextBox
                name="billNo"
                label="No"
                onChange={handleTextChange}
                value={transactionData.billNo}
                formError={formError.billNo}
              />
            </div>
            <div className="col-5">
              <DateComponent
                name="date"
                label="Date"
                value={transactionData.date}
                onChange={handleTextChange}
              />
            </div>
            <div className="col-5">
              <SearchableDrop
                label="Sample Name"
                data={sampleList}
                value={transactionData.sampleId}
                handleChange={(e) => handleSearchDropChange(e, "sampleId")}
                formError={formError.sampleId}
              />
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-2">
              <SearchableDrop
                label="Location"
                data={location}
                value={transactionData.locationId}
                handleChange={(e) => handleSearchDropChange(e, "locationId")}
                formError={formError.locationId}
              />
            </div>
            <div className="col-10">
              <SearchableDrop
                label="Party Name"
                data={partyList}
                value={transactionData.partyId}
                handleChange={(e) => handleSearchDropChange(e, "partyId")}
                formError={formError.partyId}
              />
            </div>
          </div>
        </div>

        {propertyList.length > 0 && (
          <>
            <hr />
            <div className="transaction-add-table">
              <div className="">
                <table className="table">
                  <thead>
                    <tr>
                      <th>A/C</th>
                      <th>Test Name</th>
                      <th>Remark</th>
                      <th>Price</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData?.properties?.map((ele, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <TextBox
                              className="disabled"
                              value={getPartyAccount()?.account}
                            />
                          </td>
                          <td>
                            <SearchableDrop
                              data={propertyList}
                              value={ele.pid}
                              handleChange={(e) =>
                                handlePropertyDropChange(e, index)
                              }
                            />
                          </td>
                          <td>
                            <TextBox
                              name="remark"
                              value={ele.remark}
                              onChange={(e) => handleRemark(e, index)}
                            />
                          </td>
                          <td>
                            <TextBox name="price" value={ele.price} />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={ele.paid}
                              name="paid"
                              onChange={(e) =>
                                handlePaid(e, ele, "transaction")
                              }
                              className={
                                getPartyAccount()?.account === "Y"
                                  ? "disabled"
                                  : ""
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td>
                        <TextBox
                          className="disabled"
                          value={getPartyAccount()?.account}
                        />
                      </td>
                      <td>
                        <SearchableDrop
                          data={propertyList}
                          value={newTransaction.pid}
                          handleChange={(e) => handleNewPropertyChange(e)}
                        />
                      </td>
                      <td>
                        <TextBox
                          name="remark"
                          value={newTransaction.remark}
                          onChange={(e) => handleNewPropertyRemark(e)}
                        />
                      </td>
                      <td>
                        <TextBox name="price" value={newTransaction.price} />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={newTransaction.paid}
                          name="paid"
                          onChange={(e) => handlePaid(e, ele, "newTransaction")}
                          className={
                            getPartyAccount()?.account === "Y" ? "disabled" : ""
                          }
                        />
                      </td>
                      <td>
                        <span onClick={handleAddProperty} className="plus-icon">
                          <i className={ICONS.ADD_ICON} />
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="row">
          <div className="col">Total : {totalPrice}</div>
        </div>

        <div className="row">
          <div className="col">
            <CustomButton label="Save" onClick={handleSaveBill} />
          </div>
          <div className="col">
            <CustomButton
              label="Cancel"
              onClick={handleCancel}
              className="btn-secondary"
            />
          </div>
        </div>
      </div>
      <div className="col-7">
        <TransactionBillTable
          dateFilter={dateFilter}
          handleDateChange={handleDateChange}
          handleNextDate={handleNextDate}
          handlePreviousDate={handlePreviousDate}
          header={header}
          billData={billData}
          handlePrint={handlePrint}
          handleId={handleId}
          handleTestResult={handleTestResult}
          handleSaveResult={handleSaveResult}
          result={result}
          handleTextBoxOnFocus={handleTextBoxOnFocus}
          editMode={editMode}
          current={current}
        />
      </div>

      <div>
        <AccountSummary billData={billData} />
      </div>
    </div>
  );
};

export default SampleTransaction;
