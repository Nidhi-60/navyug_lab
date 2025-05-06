import moment from "moment";
import DateComponent from "../common/Date";
import React, { useEffect } from "react";
import { ICONS } from "../constant/icons";

const DatePagination = (props) => {
  const { currentFilter, handleChange, handlePreviousDate, handleNextDate } =
    props;

  return (
    <>
      <div className="d-flex justify-content-center align-items-center">
        <div onClick={handlePreviousDate} className="pagination-icon me-2">
          <span>
            <i className={ICONS.LEFT_ICON} />
          </span>
        </div>
        <div>
          <DateComponent
            value={moment(currentFilter).format("YYYY-MM-DD")}
            onChange={handleChange}
            width="200"
          />
        </div>
        <div onClick={handleNextDate} className="pagination-icon ms-2">
          <span>
            <i className={ICONS.RIGHT_ICON} />
          </span>
        </div>
      </div>
    </>
  );
};

export default DatePagination;
