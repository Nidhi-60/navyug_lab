import React, { useCallback, useEffect, useRef, useState } from "react";
import TextBox from "../common/TextBox";
import DateComponent from "../common/Date";
import SearchableDrop from "../common/SearchableDrop";
import moment from "moment";
import { ipcRenderer } from "electron";
import CustomButton from "../common/Button";
import TransactionBillTable from "../component/TransactionBillTable";

import { useReactToPrint } from "react-to-print";
import ComponentToPrint from "../component/ComponentToPrint";
import AnalysisCertificate from "../component/AnalysisCertificate";
import { transactionValidation } from "../validation/transaction";
import { ICONS } from "../constant/icons";
import DropDown from "../common/DropDown";
import AccountSummary from "../component/AccountSummary";
import { getArrayValue } from "../utils/getArrayvalue";
import usePagination from "../hooks/usePagination";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";
import AnalysisCertificatePDF from "./AnalyticsCertificatePDF";
import { logo } from "../assests/image";

const SampleTransaction = (props) => {
  const { handleCancel } = props;
  const [transactionData, setTransactionData] = useState({
    billNo: "",
    date: moment(new Date()).format("YYYY-MM-DD"),
    sampleId: "",
    locationId: "",
    partyId: "",
    properties: [],
  });
  let [oldTransaction, setOldTransaction] = useState({});
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
  const [handlePageClick, currentItems, pageCount] = usePagination(
    10,
    billData
  );
  const [printDataCount, setPrintDataCount] = useState([]);

  const [dateFilter, setDateFilter] = useState(new Date());
  const componentRef = useRef(null);
  const [billPdfData, setBillPdfData] = useState({});
  const [result, setResult] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState({
    billNo: "",
    propertiesId: "",
    transactionProperyId: "",
  });
  const [formError, setFormError] = useState({});
  const [editBill, setEditBill] = useState({
    flag: false,
    id: undefined,
    isSampleChange: false,
    isdefaultPropertyChange: false,
  });
  const [editNewProperty, setEditNewProperty] = useState([]);
  const [defaultPropertyEditIndex, setDefaultPropertyEditIndex] = useState([]);
  const sampleRef = useRef(null);
  const pdfRef = useRef(null);
  const [pdfData, setPdfData] = useState({});
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetch(logo)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result); // this is base64 string
        };
        reader.readAsDataURL(blob);
      });
  }, []);

  useEffect(() => {
    fetchBill();
    sampleRef.current.focus();
  }, [dateFilter]);

  useEffect(() => {
    if (!editBill.flag) {
      fetchMonthBill();
    }
  }, [transactionData.date]);

  const fetchBill = () => {
    ipcRenderer.send("transactionList:load", dateFilter);

    ipcRenderer.on("transactionList:success", (e, data) => {
      let parsedData = JSON.parse(data);

      const updatedData = mergeProperties(parsedData);

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
          ...transactionData,
          date: moment(transactionData.date).format("YYYY-MM-DD"),
          sampleId: "",
          locationId: {
            label: findLocation.location,
            value: findLocation._id,
          },
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

        setPropertyList([{ _id: "", name: "select.." }, ...parsedData]);

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

        if (!editBill.flag) {
          setTransactionData({
            ...transactionData,
            properties: defaultPropertyData,
          });

          let total = defaultPropertyData.reduce((acc, curr) => {
            return acc + parseInt(curr.price);
          }, 0);

          setTotalPrice(total);
        } else {
          let updatedTransaction = transactionData.properties.map((ele) => {
            return {
              ...ele,
              isDefault: true,
              pid: { label: ele.propertyName, value: ele.pid },
            };
          });

          let finalProperty = editBill.isSampleChange
            ? defaultPropertyData
            : updatedTransaction;

          setTransactionData({
            ...transactionData,
            properties: finalProperty,
          });

          let total = finalProperty.reduce((acc, curr) => {
            return acc + parseInt(curr.price);
          }, 0);

          setTotalPrice(total);
        }
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (nextDate > today) {
      // alert("You can't select a date in the future");
      toast.success("You can't select a date in the future");
    } else {
      nextDate.setDate(currentDate.getDate() + 1);

      setDateFilter(nextDate);
    }
  };

  const handleDateChange = (e) => {
    setDateFilter(new Date(e.target.value));
  };

  const handleTextChange = (e) => {
    setFormError({ ...formError, [e.target.name]: "" });

    if (e.target.name === "date") {
      setDateFilter(e.target.value);
    }

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
    if (name === "sampleId") {
      setEditBill({
        ...editBill,
        isSampleChange: true,
      });
    }
    // if (name === "sampleId") {
    //   setTransactionData({
    //     ...transactionData,
    //     [name]: e,
    //     properties: [],
    //   });
    // } else {
    setTransactionData({
      ...transactionData,
      [name]: e,
    });
    // }
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
            transactionProperyId: ele.transactionProperyId,
          };
        }), // propertyList,
      };

      if (editBill.flag) {
        if (editBill.isSampleChange) {
          let objUpdate = {
            updateSave: {
              ...updatedObj,
              transactionId: transactionData.transactionId,
              createdAt: moment(new Date()).format("YYYY-MM-DD"),
            },
            newEdit: editNewProperty.map((ele) => {
              return { ...ele, pid: ele.pid.value, paid: ele.paid || false };
            }),
            oldDelete: oldTransaction,
          };

          ipcRenderer.send("updateBillSampleChange:load", objUpdate);

          ipcRenderer.on("updateBillSampleChange:success", (e, data) => {
            let parsedData = JSON.parse(data);

            if (parsedData.success) {
              toast.success("Bill Updated Successfully.");
              fetchBill();
              setTotalPrice(0);
              fetchMonthBill();
              setEditNewProperty([]);
              sampleRef.current.focus();
              setEditBill({
                ...editBill,
                flag: false,
                id: "",
                isSampleChange: false,
              });
            }
          });
        } else {
          let removeProp = oldTransaction.properties.filter((ele, index) => {
            if (defaultPropertyEditIndex.includes(index)) {
              return ele;
            }
          });

          let addProperty = updatedObj.propertyList.filter((ele, index) => {
            if (defaultPropertyEditIndex.includes(index)) {
              return ele;
            }
          });

          let obj = {
            updateSave: {
              ...updatedObj,
              transactionId: transactionData.transactionId,
              createdAt: moment(new Date()).format("YYYY-MM-DD"),
            },
            newEdit: editNewProperty.map((ele) => {
              return { ...ele, pid: ele.pid.value, paid: ele.paid || false };
            }),
            isdefaultPropertyChange: editBill.isdefaultPropertyChange,
            addProperty,
            removeProp,
          };

          ipcRenderer.send("updateBill:load", obj);
          ipcRenderer.on("updateBill:success", (e, data) => {
            let parsedData = JSON.parse(data);

            if (parsedData.success) {
              toast.success("Bill Updated Successfully.");
              fetchBill();
              setTotalPrice(0);
              fetchMonthBill();
              setEditNewProperty([]);
              sampleRef.current.focus();
              setEditBill({
                ...editBill,
                flag: false,
                id: "",
                isSampleChange: false,
              });
            }
          });
        }
      } else {
        ipcRenderer.send("addBill:load", updatedObj);
        ipcRenderer.on("addBill:success", (e, data) => {
          toast.success("Bill Added Successfully.");
          fetchBill();
          setTotalPrice(0);
          fetchMonthBill();
          sampleRef.current.focus();
        });
      }
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

    setPrintDataCount([]);
    return Promise.resolve();
  }, []);

  const handleId = (e, id) => {
    if (printDataCount.length > 0) {
      let filteredData = billData.filter((ele, index) =>
        printDataCount.includes(index)
      );

      function getKey(obj) {
        return (
          obj.companyName.toLowerCase().trim() + "|" + obj.sampleName.trim()
        );
      }

      function getPropertyIds(obj) {
        return obj.properties.map((p) => p.pid);
      }

      const groups = {};

      filteredData.forEach((obj) => {
        const key = getKey(obj);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(obj);
      });

      const result = [];

      Object.values(groups).forEach((group) => {
        // Check if any pair inside group shares at least one property
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const pidsA = getPropertyIds(group[i]);
            const pidsB = getPropertyIds(group[j]);

            const hasCommonPid = pidsA.some((pid) => pidsB.includes(pid));

            if (hasCommonPid) {
              if (!result.includes(group[i])) result.push(group[i]);
              if (!result.includes(group[j])) result.push(group[j]);
            }
          }
        }
      });

      if (result.length > 0) {
        let properties = result.reduce((curr, acc) => {
          return [...curr, ...acc.properties];
        }, []);

        setBillPdfData({ ...result[0], properties });
      } else {
        let findData = billData.find((ele) => ele.transactionId === id);

        setBillPdfData(findData);
      }
    } else {
      let findData = billData.find((ele) => ele.transactionId === id);

      setBillPdfData(findData);
    }
  };

  useEffect(() => {
    if (Object.keys(billPdfData).length > 0) {
      // handlePrint();
      ipcRenderer.send("print", componentRef.current.innerHTML, "report");
    }
  }, [billPdfData]);

  useEffect(() => {
    if (Object.keys(pdfData).length > 0) {
      // handlePrint();
      ipcRenderer.send("pdfPrint", pdfRef.current.innerHTML);
    }
  }, [pdfData]);

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
      setEditMode(false);
      setResult({});
      ipcRenderer.on("updateResult:success", (e, data) => {
        fetchBill();
      });
    } else {
      ipcRenderer.send("saveTestResult:load", {
        ...result,
        createdAt: moment(new Date()).format("YYYY-MM-DD"),
      });
      ipcRenderer.on("saveTestResult:success", (e, data) => {
        setEditMode(false);
        setResult({});
        fetchBill();
      });
    }
  };

  const handleTextBoxOnFocus = (
    e,
    value,
    billId,
    propertyId,
    resultId,
    transactionProperyId
  ) => {
    if (resultId) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }

    setCurrent({
      billId: billId,
      propertyId: propertyId,
      transactionProperyId: transactionProperyId,
    });
    setResult({
      ...result,
      result: value,
      resultId: resultId,
    });
  };

  const handleCancelTwo = () => {
    setTransactionData({
      billNo: "",
      date: moment(new Date()).format("YYYY-MM-DD"),
      sampleId: "",
      locationId: "",
      partyId: "",
    });
    handleCancel();
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

  const handleNewEditPropertyRemark = (e, index) => {
    let updatedNewProperty = editNewProperty.map((ele, eleIndex) => {
      if (eleIndex === index) {
        return {
          ...ele,
          remark: e.target.value,
        };
      } else {
        return ele;
      }
    });

    setEditNewProperty(updatedNewProperty);
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

  const handlePropertyDropChange = (e, index, ele) => {
    if (e.value === "") {
      if (ele.isDefault) {
        let idObj = {
          billNo: transactionData.billNo,
          transactionId: transactionData.transactionId,
          transactionPropertyId: ele.transactionProperyId,
          pid: ele.pid.value,
          resultId: ele.resultId,
        };

        ipcRenderer.send("deleteDefautProperty:load", idObj);

        ipcRenderer.on("deleteDefautProperty:success", (e, data) => {
          let parsedData = JSON.parse(data);

          if (parsedData.success) {
            setTransactionData({
              ...transactionData,
              properties: transactionData.properties.filter(
                (_, eleIndex) => eleIndex !== index
              ),
            });
          }
        });
      } else {
        setTransactionData({
          ...transactionData,
          properties: transactionData.properties.filter(
            (_, eleIndex) => eleIndex !== index
          ),
        });
      }
    } else {
      setEditBill({
        ...editBill,
        isdefaultPropertyChange: true,
      });

      if (!defaultPropertyEditIndex.includes(index)) {
        setDefaultPropertyEditIndex([...defaultPropertyEditIndex, index]);
      }

      let p = propertyList.find((ele) => e.value === ele._id);

      setTransactionData({
        ...transactionData,
        properties: transactionData.properties.map((ele, eleIndex) => {
          if (eleIndex === index) {
            return {
              ...ele,
              pid: { label: e.label, value: p.propertyId },
              price: p.pprice,
              unit: p.punit,
            };
          } else {
            return ele;
          }
        }),
      });
    }
  };

  const handleNewEditPropertyDropChange = (e, index) => {
    if (e.value === "") {
      let updatedTransaction = editNewProperty.filter(
        (ele, eleIndex) => eleIndex !== index
      );

      setEditNewProperty(updatedTransaction);
    } else {
      let p = propertyList.find((ele) => e.value === ele._id);

      let updatedDropValue = editNewProperty.map((ele, eleIndex) => {
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
      });

      setEditNewProperty(updatedDropValue);
    }
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
    if (!editBill.flag) {
      let alreadyExists = transactionData.properties.find(
        (ele) =>
          ele.pid.value === newTransaction.pid.value &&
          ele.price === newTransaction.price
      );

      if (alreadyExists) {
        toast.error("Property already exists.");
      } else {
        setTransactionData({
          ...transactionData,
          properties: [...transactionData.properties, newTransaction],
        });
        setNewTransaction({
          pid: "",
          price: "",
          remark: "",
        });
      }
    } else {
      let mergedData = [...transactionData.properties, ...editNewProperty];

      let alreadyExists = mergedData.find(
        (ele) =>
          ele.pid.value === newTransaction.pid.value &&
          ele.price === newTransaction.price
      );
      if (alreadyExists) {
        toast.error("Property already exists.");
      } else {
        setEditNewProperty([...editNewProperty, newTransaction]);

        setNewTransaction({
          pid: "",
          price: "",
          remark: "",
        });
      }
    }

    setTotalPrice(totalPrice + parseInt(newTransaction.price));
  };

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

  const handleEditNewProperty = (e, data, key) => {
    let updatedProperty = editNewProperty.map((ele) => {
      return {
        ...ele,
        paid: e.target.checked,
      };
    });

    setEditNewProperty(updatedProperty);

    setTransactionData({
      ...transactionData,
      properties: transactionData.properties.map((ele) => {
        return {
          ...ele,
          paid: e.target.checked,
        };
      }),
    });
  };

  const handleEditData = (e, id) => {
    setEditBill({ flag: true, id: id });

    let findData = billData.find((ele) => ele.transactionId === id);

    let sampleData = getArrayValue(findData.sampleId, sampleList, "_id");
    let locationData = getArrayValue(
      findData.locationName,
      location,
      "location"
    );
    let companyData = getArrayValue(
      findData.companyName,
      partyList,
      "companyName"
    );

    let updatedObj = {
      ...findData,
      sampleId: { value: sampleData?._id, label: sampleData?.sampleName },
      locationId: { value: locationData?._id, label: locationData?.location },
      partyId: { value: companyData?._id, label: companyData?.companyName },
    };

    setTransactionData(updatedObj);
    setOldTransaction(JSON.parse(JSON.stringify(updatedObj)));
  };

  const handleMultiplePrint = (e, data, index) => {
    if (e.target.checked) {
      setPrintDataCount([...printDataCount, index]);
    } else {
      setPrintDataCount(printDataCount.filter((ele) => ele !== index));
    }
  };

  const handlePdf = (e, id) => {
    let findData = billData.find((ele) => ele.transactionId === id);

    setPdfData(findData);
  };

  return (
    <div className="row">
      {Object.keys(billPdfData).length > 0 && (
        <ComponentToPrint ref={componentRef} className="printContent">
          <AnalysisCertificate printData={billPdfData} />
        </ComponentToPrint>
      )}

      {Object.keys(pdfData).length > 0 && logoBase64 && (
        <ComponentToPrint ref={pdfRef} className="printContent">
          <AnalysisCertificatePDF pdfData={pdfData} logoBase64={logoBase64} />
        </ComponentToPrint>
      )}

      <div className="d-flex">
        <div className="sample-detail">
          <div className="">
            <div className="row mb-2 d-flex">
              <div className="mr-5">
                <TextBox
                  name="billNo"
                  label="No"
                  onChange={handleTextChange}
                  value={transactionData.billNo}
                  formError={formError.billNo}
                  width="30"
                />
              </div>
              <div className="mr-5">
                <DateComponent
                  name="date"
                  label="Date"
                  value={transactionData.date}
                  onChange={handleTextChange}
                  width="130"
                  max={moment(new Date()).format("YYYY-MM-DD")}
                />
              </div>
              <div className="col-5">
                <SearchableDrop
                  label="Sample Name"
                  data={sampleList}
                  value={transactionData.sampleId}
                  handleChange={(e) => handleSearchDropChange(e, "sampleId")}
                  formError={formError.sampleId}
                  width="320"
                  sampleRef={sampleRef}
                />
              </div>
            </div>
            <div className="row mb-2 d-flex">
              <div className="col-2 mr-5">
                <SearchableDrop
                  label="Location"
                  data={location}
                  value={transactionData.locationId}
                  handleChange={(e) => handleSearchDropChange(e, "locationId")}
                  formError={formError.locationId}
                  width="100"
                />
              </div>
              <div className="col-10">
                <SearchableDrop
                  label="Party Name"
                  data={partyList}
                  value={transactionData.partyId}
                  handleChange={(e) => handleSearchDropChange(e, "partyId")}
                  formError={formError.partyId}
                  width="400"
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
                                className="disabled w-20"
                                value={getPartyAccount()?.account}
                                readOnly
                              />
                            </td>
                            <td>
                              <SearchableDrop
                                data={propertyList}
                                value={ele.pid}
                                handleChange={(e) =>
                                  handlePropertyDropChange(e, index, ele)
                                }
                                width="200"
                              />
                            </td>
                            <td>
                              <TextBox
                                name="remark"
                                value={ele.remark}
                                onChange={(e) => handleRemark(e, index)}
                                width="100"
                              />
                            </td>
                            <td>
                              <TextBox
                                name="price"
                                value={ele.price}
                                width="100"
                                readOnly
                              />
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

                      {/* on edit new property save */}
                      {editBill.flag &&
                        editNewProperty.map((ele, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                <TextBox
                                  className="disabled w-20"
                                  value={getPartyAccount()?.account}
                                  readOnly
                                />
                              </td>
                              <td>
                                <SearchableDrop
                                  data={propertyList}
                                  value={ele.pid}
                                  handleChange={(e) =>
                                    handleNewEditPropertyDropChange(e, index)
                                  }
                                  width="200"
                                />
                              </td>
                              <td>
                                <TextBox
                                  name="remark"
                                  value={ele.remark}
                                  onChange={(e) =>
                                    handleNewEditPropertyRemark(e, index)
                                  }
                                  width="100"
                                />
                              </td>
                              <td>
                                <TextBox
                                  name="price"
                                  value={ele.price}
                                  width="100"
                                  readOnly
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={ele.paid}
                                  name="paid"
                                  onChange={(e) =>
                                    handleEditNewProperty(e, ele, "transaction")
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
                            className="disabled w-20"
                            value={getPartyAccount()?.account}
                            readOnly
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
                            width="100"
                          />
                        </td>
                        <td>
                          <TextBox
                            name="price"
                            value={newTransaction.price}
                            width="100"
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={newTransaction.paid}
                            name="paid"
                            onChange={(e) =>
                              handlePaid(e, undefined, "newTransaction")
                            }
                            className={
                              getPartyAccount()?.account === "Y"
                                ? "disabled"
                                : ""
                            }
                          />
                        </td>
                        <td>
                          <span
                            onClick={handleAddProperty}
                            className="plus-icon"
                          >
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

          <div className="d-flex justify-content-center mt-5">
            <div className="col mr-5">
              <CustomButton
                label={editBill.flag ? "Update" : "Save"}
                onClick={handleSaveBill}
                className="btn-primary"
              />
            </div>
            <div className="col">
              <CustomButton
                label="Cancel"
                onClick={handleCancelTwo}
                className="btn-secondary"
              />
            </div>
          </div>
        </div>

        <div className="transaction-table">
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
            handleEditData={handleEditData}
            editBill={editBill}
            handlePageClick={handlePageClick}
            pageCount={pageCount}
            handleMultiplePrint={handleMultiplePrint}
            printDataCount={printDataCount}
            handlePdf={handlePdf}
          />
        </div>
      </div>

      <div>
        <AccountSummary billData={billData} />
      </div>
    </div>
  );
};

export default SampleTransaction;
