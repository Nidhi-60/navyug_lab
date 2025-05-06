import React from "react";
import CustomButton from "../common/Button";
import moment from "moment";
import DatePagination from "./DatePagination";
import TextBox from "../common/TextBox";
import { ICONS } from "../constant/icons";
import ReactPaginate from "react-paginate";

const TransactionBillTable = (props) => {
  const {
    dateFilter,
    handleDateChange,
    handleNextDate,
    handlePreviousDate,
    header,
    billData,
    handlePrint,
    handleId,
    handleTestResult,
    handleSaveResult,
    result,
    handleTextBoxOnFocus,
    editMode,
    current,
    handleEditData,
    editBill,
    handlePageClick,
    pageCount,
    handleMultiplePrint,
    printDataCount,
  } = props;

  return (
    <div className="row">
      <div className="mb-3">
        <DatePagination
          currentFilter={dateFilter}
          handleChange={handleDateChange}
          handleNextDate={handleNextDate}
          handlePreviousDate={handlePreviousDate}
        />
      </div>
      <div className="row transaction-table">
        <table className="table" border={1} width={"100%"}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Print</th>
              <th>SampleName</th>
              <th>CompanyName</th>
              <th>AC</th>
              <th>Location</th>
              <th>Test Name</th>
              <th>Test Result</th>
              <th>Amount</th>
              <th>Remark</th>
              <th>Paid</th>
              <th>Test Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {billData.map((ele, index) => {
              return ele.properties.map((property, propertyIndex) => (
                <tr key={`${index}-${propertyIndex}`}>
                  {propertyIndex === 0 && (
                    <>
                      <td rowSpan={ele.properties.length}>
                        <span
                          onClick={(e) => handleEditData(e, ele.transactionId)}
                        >
                          <i className={ICONS.EDIT_ICON} />
                        </span>
                      </td>
                      <td rowSpan={ele.properties.length}>
                        <CustomButton
                          label="Print"
                          onClick={(e) => handleId(e, ele.transactionId)}
                        />
                      </td>
                      <td rowSpan={ele.properties.length}>{ele?.sampleName}</td>
                      <td rowSpan={ele.properties.length}>
                        {ele?.companyName}
                      </td>
                      <td rowSpan={ele.properties.length}>{ele?.account}</td>
                      <td rowSpan={ele.properties.length}>
                        {ele?.locationName}
                      </td>
                    </>
                  )}

                  <td>{property.propertyName}</td>
                  <td>
                    <TextBox
                      key={propertyIndex}
                      onChange={(e) =>
                        handleTestResult(
                          e,
                          ele,
                          property.pid,
                          property.transactionProperyId
                        )
                      }
                      handleOnBlur={handleSaveResult}
                      handleOnFocus={(e) =>
                        handleTextBoxOnFocus(
                          e,
                          property.result,
                          ele.transactionId,
                          property.pid,
                          property.resultId,
                          property.transactionProperyId
                        )
                      }
                      value={
                        editMode &&
                        ele.transactionId === current.billId &&
                        property.pid === current.propertyId &&
                        property.transactionProperyId ===
                          current.transactionProperyId
                          ? result.result
                          : property.result
                      }
                      width="100"
                    />
                  </td>
                  <td>{property.price}</td>
                  <td>{property.remark}</td>
                  <td>{property.paid ? "Yes" : "No"}</td>
                  {propertyIndex === 0 && (
                    <>
                      <td rowSpan={ele.properties.length}>
                        {moment(ele.createdAt).format("DD-MM-YY")}
                      </td>
                      <td rowSpan={ele.properties.length}>
                        <input
                          type="checkbox"
                          onChange={(e) => handleMultiplePrint(e, ele, index)}
                          value={printDataCount.includes(index)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      <div>
        <div>
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            activeClassName="active"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionBillTable;
