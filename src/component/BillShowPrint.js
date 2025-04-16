import moment from "moment";
import React, { Fragment, useState } from "react";

const BillShowPrint = (props) => {
  const { reportData, filterData } = props;

  let basePrice = 0;
  let sgst = 0;
  let cgst = 0;
  let total = 0;

  return (
    <div className="m-5">
      <div className="mb-3">
        <div className="row mb-2">
          <div className="col-6">
            <span className="fw-bold me-2">Party Name:</span>
            <span>{reportData[0].companyName}</span>
          </div>
          <div className="col-6">
            <span className="fw-bold me-2">Bill No: </span>
            <span>{filterData.billNo}</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <span className="fw-bold me-2">From Date: </span>
            <span>{moment(filterData?.fromDate).format("DD/MM/YYYY")}</span>
          </div>
          <div className="col-3">
            <span className="fw-bold me-2">To Date: </span>
            <span>{moment(filterData?.toDate).format("DD/MM/YYYY")}</span>
          </div>
          <div className="col-6">
            <span className="fw-bold me-2">Bill Date:</span>
            <span>{moment(new Date()).format("DD/MM/YYYY")}</span>
          </div>
        </div>
      </div>

      <hr />

      <table className="table">
        <thead>
          <tr>
            <th>Sr No</th>
            {/* <th>Test Date</th> */}
            <th>SampleName</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
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
            total += ele.quntity * rowRate * 1.18;

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {ele.sampleName}
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
          <tr>
            <td colSpan={4}>SGST(18%) : </td>
            <td>{sgst}</td>
          </tr>
          <tr>
            <td colSpan={4}>CGST(18%) : </td>
            <td>{cgst}</td>
          </tr>
          <tr>
            <td colSpan={4}>Grand Total:</td>
            <td>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BillShowPrint;
