import moment from "moment";
import React from "react";

const AnalysisCertificate = (props) => {
  const { printData } = props;

  return (
    <div className="m-5">
      <div className="d-flex justify-content-around">
        <div>{printData?.companyName}</div>

        <div>{moment(new Date()).format("DD/MM/YYYY")}</div>
      </div>

      <div className="d-flex justify-content-around">
        <div>{printData?.sampleName}</div>
        <div></div>
      </div>

      <div className="" style={{ marginTop: "30px" }}>
        <table width={"100%"}>
          <tbody>
            {printData?.properties?.map((ele, index) => {
              return (
                <tr key={index}>
                  <td>{ele.propertyName}</td>
                  <td>
                    {ele.result} {ele.punit}
                  </td>
                  <td>{ele.remark}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* {printData?.properties?.map((ele, index) => {
          return (
            <div key={index} className="d-flex justify-content-around">
              <div>
                <span className="me-3">{ele.propertyName}</span>
              </div>
              <div>
                <span>
                  {ele.result} {ele.punit}
                </span>
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
};

export default AnalysisCertificate;
