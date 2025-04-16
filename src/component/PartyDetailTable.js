import React from "react";
import CustomButton from "../common/Button";
import { ICONS } from "../constant/icons";

const PartyDetailTable = (props) => {
  const { columns, data, handleEdit, handleDelete } = props;

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((ele, index) => {
            return <th key={index}>{ele}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {data?.map((ele, index) => {
          return (
            <tr key={index}>
              <td>{ele.companyName || "-"}</td>
              <td>{ele.address || "-"}</td>
              <td>{ele.companyCity || "-"}</td>
              <td>{ele.contactNo || "-"}</td>
              <td>{ele.contactPersonName || "-"}</td>
              <td>{ele.contactPersonMobileNo || "-"}</td>
              <td>{ele.officeContactPerson || "-"}</td>
              <td>{ele.officeAddress || "-"}</td>
              <td>{ele.officeContactNo || "-"}</td>
              <td>{ele.account || "-"}</td>
              <td>{ele.stNo || "-"}</td>
              <td>{ele.tdsNo || "-"}</td>
              <td>
                <span
                  onClick={(e) => handleEdit(e, ele._id)}
                  className="cursor-pointer me-2"
                >
                  <i className={ICONS.EDIT_ICON} />
                </span>

                <span
                  onClick={(e) => handleDelete(e, ele._id)}
                  className="cursor-pointer"
                >
                  <i className={ICONS.DELETE_ICON} />
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PartyDetailTable;
