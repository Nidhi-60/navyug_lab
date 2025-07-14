import moment from "moment";
import React from "react";

const AnalysisCertificatePDF = ({ pdfData, logoBase64 }) => {
  return (
    <>
      <div className="cert-page" id="cert-page">
        <header className="cert-header">
          <div className="lab-info">
            <div>
              <strong>Laboratory:</strong> 66, Hirabhai Market, Diwan
              Ballubhai Road,
              <br />
              Behind EKA Club, Kankaria, Ahmedabad 22
            </div>
            <div>
              <strong>Phone:</strong> M 9228121142 • 999818292
            </div>
            <div>www.navyuglab.com &nbsp;|&nbsp; navyuglab83@gmail.com</div>
          </div>

          <div className="logo-block">
            {/* replace src with real logo if you have one */}
            <div className="">
              {logoBase64 && <img src={logoBase64} height={100} width={100} />}
            </div>
            <div className="logo-text">
              <h2>NAVYUG</h2>
              <div>ANALYTICAL LABORATORY</div>
              <div>Since 1983</div>
            </div>
          </div>
        </header>

        {/* narrow grey strip */}
        <div className="strip">
          <span>Timing : 10.30 a.m to 7.00 p.m.</span>
          <span>
            Testing of Dye’s Intermediate, Fine Chemicals &amp;
            Textile Auxiliary
          </span>
        </div>

        {/* red title */}
        <h1 className="cert-title">CERTIFICATE OF ANALYSIS</h1>
        <p className="sub">(Sample drawn and submitted by the party)</p>

        {/* meta */}
        <div className="meta">
          <div>
            <strong>Ref No.</strong> -
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {moment(pdfData.createdAt).format("DD/MM/YYYY")}
          </div>
        </div>

        {/* section 1 */}
        <h3 className="sec-heading">1. Particular of Sample Submitted:</h3>
        <table className="details-table">
          <thead>
            <tr>
              <th>Name of the Company</th>
              <th>Date of Receipt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{pdfData.companyName}</td>
              <td>{moment(pdfData.createdAt).format("DD/MM/YYYY")}</td>
            </tr>
            <tr>
              <th>Name of the Sample</th>
              <th>Quantity</th>
            </tr>
            <tr>
              <td>{pdfData.sampleName}</td>
              <td>{pdfData.quantity}</td>
            </tr>
          </tbody>
        </table>

        {/* section 2 */}
        <div className="results-head">
          <h3>2. Result of Analysis:</h3>
          <span>Remark:</span>
        </div>

        <div className="results-block">
          <table className="results-table">
            <tbody>
              {pdfData.properties.map((r, index) => (
                <tr key={index}>
                  <td>{r.propertyName}</td>
                  <td>
                    :-&nbsp;{r.result}&nbsp;{r.punit}
                  </td>
                  <td>({r.remark})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* signature */}
        <div className="sig-area">
          <div>
            <strong>Analyst:</strong>
          </div>
          <div className="blank-line"></div>
          <div>
            <strong>For: Navyug Analytical Laboratory</strong>
          </div>
          <div className="auth-sign">Authorized Signature</div>
        </div>

        {/* footer note */}
        <p className="note">
          Laboratory is only responsible for the report for this particular
          sample. After the sample is given back to the client, analysis will
          NOT be repeated &amp; hence we suggest to retain the sample with
          laboratory. The result reported in this report is not meant for public
          arbitration or as an evidence in legal dispute.
        </p>

        {/* watermark */}
        {/* <div className="watermark"> */}
        <img class="logo-watermark" src={logoBase64} />
        {/* </div> */}
      </div>
    </>
  );
};

export default AnalysisCertificatePDF;
