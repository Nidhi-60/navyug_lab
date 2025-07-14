import moment from "moment";
import React, { Fragment, useState } from "react";
import { ToWords } from "to-words";

// const toWords = new ToWords({
//   localeCode: "en-IN",
//   converterOptions: {
//     currency: true,
//     ignoreDecimal: false,
//     ignoreZeroCurrency: false,
//     doNotAddOnly: false,
//     currencyOptions: {
//       // can be used to override defaults for the selected locale
//       name: "Rupee",
//       plural: "Rupees",
//       symbol: "₹",
//       fractionalUnit: {
//         name: "Paisa",
//         plural: "Paise",
//         symbol: "",
//       },
//     },
//   },
// });

const BillShowPrint = (props) => {
  const { reportData, filterData, switchData } = props;
  const toWords = new ToWords();

  let basePrice = 0;
  let sgst = 0;
  let cgst = 0;
  let total = 0;
  let gstVal = switchData ? 1.18 : 1;

  let tableStyle = {
    padding: "12px",
    textAlign: "center",
  };

  let signText = {
    textAlign: "end",
  };

  return (
    <div className="m-5">
      {/* <div
        className="mb-3"
        style={{ border: "1px solid black", marginTop: "5px", width: "100%" }}
      >
        <div style={{ display: "flex" }}>
          <div style={nameStyle}>Party Name : </div>
          <div>{reportData[0].companyName}</div>
          <div style={nameStyle}>Bill No</div>
          <div>{filterData.billNo}</div>
        </div>

        <div style={{ display: "flex" }}>
          <div style={nameStyle}>From Date: </div>
          <div>{moment(filterData?.fromDate).format("DD/MM/YYYY")}</div>
          <div style={nameStyle}>To Date: </div>
          <div>{moment(filterData?.toDate).format("DD/MM/YYYY")}</div>
          <div style={nameStyle}>Bill Date</div>
          <div>{moment(new Date()).format("DD/MM/YYYY")}</div>
        </div>
      </div> */}
      <table width={"100%"} border={1}>
        <tbody>
          <tr>
            <th style={tableStyle}>Party Name :</th>
            <td colSpan={3} style={tableStyle}>
              {reportData[0].companyName}
            </td>
            <th style={tableStyle}>Bill No : </th>
            <td style={tableStyle}>{filterData.billNo}</td>
          </tr>
          <tr>
            <th style={tableStyle}>From Date: </th>
            <td style={tableStyle}>
              {moment(filterData?.fromDate).format("DD/MM/YYYY")}
            </td>
            <th style={tableStyle}>To Date: </th>
            <td style={tableStyle}>
              {moment(filterData?.toDate).format("DD/MM/YYYY")}
            </td>
            <th style={tableStyle}>Bill Date : </th>
            <td style={tableStyle}>
              {moment(new Date()).format("DD/MM/YYYY")}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="table" border={1} width={"100%"}>
        <thead>
          <tr>
            <th>Sr No</th>
            {/* <th>Test Date</th> */}
            <th>SampleName</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((ele, index) => {
            let rowRate = ele.properties.reduce((acc, cur) => {
              return acc + parseInt(cur.pprice);
            }, 0);

            basePrice += ele.quntity * rowRate;
            cgst += ele.quntity * rowRate * 0.09;
            sgst += ele.quntity * rowRate * 0.09;
            total += ele.quntity * rowRate * gstVal;

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {ele.sampleName}
                  <br />
                  {" ("}
                  {ele.properties.map((p, index) => {
                    return (
                      <Fragment key={index}>
                        {p.propertyName} {p.punit}{" "}
                        {index === ele.properties.length - 1 ? "" : " + "}
                      </Fragment>
                    );
                  })}{" "}
                  {" ) "}
                </td>
                <td>{ele.quntity}</td>
                <td>{rowRate}</td>
                <td>{ele.quntity * rowRate}</td>
              </tr>
            );
          })}

          {/* {reportData.map((ele, index) => {
            return ele.properties.map((property, propertyIndex) => (
              <tr key={`${index}-${propertyIndex}`}>
                {propertyIndex === 0 && (
                  <>
                    <td rowSpan={ele.properties.length}>{index + 1}</td>

                    <td rowSpan={ele.properties.length}>{ele?.sampleName}</td>
                  </>
                )}
                <td>{property.propertyName}</td>
                <td>{property.pprice}</td>
              </tr>
            ));
          })} */}
          <tr>
            <td colSpan={4}>Total</td>
            <td>{basePrice}</td>
          </tr>
          <tr>
            <td colSpan={4}>Discount : </td>
            <td></td>
          </tr>
          {switchData && (
            <>
              <tr>
                <td colSpan={4}>SGST(18%) : </td>
                <td>{sgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4}>CGST(18%) : </td>
                <td>{cgst.toFixed(2)}</td>
              </tr>
            </>
          )}
          <tr>
            <td colSpan={4}>Grand Total:</td>
            <td>{total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={5}>Amount In Words: {toWords.convert(total)}</td>
          </tr>
        </tbody>
      </table>

      <div style={signText}>
        <div
          style={{ fontSize: "15px", fontWeight: "bold", textAlign: "end " }}
        >
          For Navyug Analytical Laboratory
        </div>
      </div>
    </div>
  );
};

export default BillShowPrint;
