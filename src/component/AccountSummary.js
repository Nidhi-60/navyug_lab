import React, { useEffect, useState } from "react";

const AccountSummary = (props) => {
  const { billData } = props;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (billData) {
      let properties = [];

      billData.forEach((ele) => {
        properties.push(...ele.properties);
      });

      let total = properties.reduce((acc, curr) => {
        return acc + parseInt(curr.price);
      }, 0);

      setTotal(total);
    }
  }, [billData]);

  return (
    <div className="row">
      <div className="col-6">Grand Total : {total}</div>
    </div>
  );
};

export default AccountSummary;
