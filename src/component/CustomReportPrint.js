import moment from "moment";
import React from "react";

const CustomReportPrint = (props) => {
  const { report } = props;

  return (
    <div className="m-5">
      <table className="table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>AC</th>
            <th>SampleName</th>
            <th>Test Name</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Test Date</th>
          </tr>
        </thead>
        <tbody>
          {report.map((ele, index) => {
            return ele.properties.map((property, propertyIndex) => (
              <tr key={`${index}-${propertyIndex}`}>
                {propertyIndex === 0 && (
                  <>
                    <td rowSpan={ele.properties.length}>{ele?.companyName}</td>
                    <td rowSpan={ele.properties.length}>{ele?.account}</td>
                    <td rowSpan={ele.properties.length}>{ele?.sampleName}</td>
                  </>
                )}
                <td>{property.propertyName}</td>
                <td>{property.punit}</td>
                <td>{property.pprice}</td>

                {propertyIndex === 0 && (
                  <td rowSpan={ele.properties.length}>
                    {moment(ele.createdAt).format("DD-MM-YY")}
                  </td>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomReportPrint;
