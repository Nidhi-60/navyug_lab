import React, { useEffect, useState } from "react";
import usePagination from "../hooks/usePagination";
import { ICONS } from "../constant/icons";
import { ipcRenderer } from "electron";
import TextBox from "../common/TextBox";
import CustomButton from "../common/Button";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";

const Unit = (props) => {
  const { handleCancel } = props;
  const [unitData, setUnitData] = useState({
    unitName: "",
    _id: "",
  });
  const [isedit, setIsEdit] = useState({
    flag: false,
    id: undefined,
  });
  const [unitList, setUnitList] = useState([]);
  const [handlePageClick, currentItems, pageCount] = usePagination(
    10,
    unitList
  );

  useEffect(() => {
    refetchUnit();
  }, []);

  const refetchUnit = () => {
    ipcRenderer.send("unit:load");

    ipcRenderer.on("unit:success", (e, data) => {
      setUnitList(JSON.parse(data));
    });
  };

  const handleDelete = (id) => {
    ipcRenderer.send("deleteUnit:load", { uid: id });

    ipcRenderer.on("deleteUnit:success", (e, data) => {
      refetchUnit();
      toast.error("Unit Deleted Successfully.");
    });
  };

  const handleEdit = (id) => {
    setIsEdit({
      flag: true,
      id: id,
    });
    let findedUnit = unitList.find((sample) => sample._id === id);

    setUnitData(findedUnit);
  };

  const handleAddUnit = () => {
    let replceID = unitData.unitName.replaceAll(" ", "");

    let obj = {
      ...unitData,
      unitName: unitData.unitName.toUpperCase(),
      _id: replceID.toLowerCase(),
    };

    let alreadyExists = unitList.find(
      (ele) => ele.unitName === obj.unitName || ele._id === obj._id
    );

    if (alreadyExists) {
      toast.error("Already exists.");
    } else {
      if (isedit.flag) {
        ipcRenderer.send("updateUnit:load", obj);

        ipcRenderer.on("updateUnit:success", (e, data) => {
          setUnitData({
            unitName: "",
            _id: "",
          });

          refetchUnit();
          toast.success("Unit updated successfully.");
        });
      } else {
        ipcRenderer.send("addUnit:load", obj);

        ipcRenderer.on("addUnit:success", (e, data) => {
          setUnitData({
            unitName: "",
            _id: "",
          });

          refetchUnit();
          toast.success("Unit Added successfully.");
        });
      }
    }
  };

  const handleCancel2 = () => {
    handleCancel();
  };

  const handleUnitChange = (e) => {
    setUnitData({
      ...unitData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="row">
      <div className="col-12">
        <p className="text-header">Add Unit here</p>
        <div className="d-flex justify-content-center">
          <div className="col-6 mr-5">
            <TextBox
              label="Unit Name"
              name="unitName"
              value={unitData.unitName}
              onChange={handleUnitChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <div className="mr-5 cursor-pointer">
            <CustomButton
              label={isedit.flag ? "Update" : "Save"}
              onClick={handleAddUnit}
              className="btn-primary"
            />
          </div>
          <div>
            <CustomButton
              label="Cancel"
              className="btn-secondary"
              onClick={handleCancel2}
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-5">
        <table className="table" border={1} width={"100%"}>
          <thead>
            <tr>
              <th>Unit Name</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unitList.map((sample, index) => {
              return (
                <tr key={index}>
                  <td>{sample.unitName}</td>
                  <td>
                    <span
                      className="me-2"
                      onClick={() => handleEdit(sample._id)}
                    >
                      <i className={ICONS.EDIT_ICON} />
                    </span>
                    <span onClick={() => handleDelete(sample.uid)}>
                      <i className={ICONS.DELETE_ICON} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* <div>
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
      </div> */}
    </div>
  );
};

export default Unit;
