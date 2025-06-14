import React, { useEffect, useState } from "react";
import CustomButton from "../common/Button";
import TextBox from "../common/TextBox";
import { ipcRenderer } from "electron";

import { ICONS } from "../constant/icons";
import { strUpperCase } from "../utils/strUpperCase";
import usePagination from "../hooks/usePagination";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";

const Properties = (props) => {
  const { handleCancel } = props;
  const [propertyDetail, setPropertyDetail] = useState({
    propertyName: "",
    description: "",
  });
  const [propertyList, setPropertyList] = useState([]);
  const [isedit, setIsEdit] = useState({
    flag: false,
    id: undefined,
  });
  const [handlePageClick, currentItems, pageCount] = usePagination(
    10,
    propertyList
  );

  const handlePropertyChange = (e) => {
    setPropertyDetail({ ...propertyDetail, [e.target.name]: e.target.value });
  };

  const handleAddProperty = () => {
    let formatedData = {
      ...propertyDetail,
      propertyName: strUpperCase(propertyDetail.propertyName),
      description: strUpperCase(propertyDetail.description),
    };

    if (!isedit.flag) {
      ipcRenderer.send("addProperty:load", formatedData);

      ipcRenderer.on("addProperty:success", (e, data) => {
        let parsedData = JSON.parse(data);

        if (parsedData.success) {
          toast.success("Property Added Successfully.");
        } else {
          toast.error(parsedData.msg);
        }

        setPropertyDetail({
          propertyName: "",
          description: "",
        });
        refetchProperty();

        setIsEdit({
          flag: false,
          id: undefined,
        });
      });
    } else {
      ipcRenderer.send("updateProperty:load", formatedData);

      ipcRenderer.on("updateProperty:success", (e, data) => {
        toast.success("Property Updated Successfully.");
      });

      setPropertyDetail({
        propertyName: "",
        description: "",
      });
      refetchProperty();

      setIsEdit({
        flag: false,
        id: undefined,
      });
    }
  };

  useEffect(() => {
    refetchProperty();
  }, []);

  const refetchProperty = () => {
    ipcRenderer.send("propertyList:load");

    ipcRenderer.on("propertyList:success", (e, data) => {
      setPropertyList(JSON.parse(data));
    });
  };

  const handleCancelTwo = () => {
    setPropertyDetail({ description: "", propertyName: "" });
    handleCancel();
  };

  const handleEdit = (id) => {
    setIsEdit({
      flag: true,
      id: id,
    });
    let findedProperty = propertyList.find((ele) => ele._id === id);

    setPropertyDetail(findedProperty);
  };

  const handleDelete = (id) => {
    ipcRenderer.send("deleteProperty:load", { _id: id });
    ipcRenderer.on("deleteProperty:success", (e, data) => {
      toast.success("Property Deleted Successfully.");
      refetchProperty();
    });
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <p className="text-header">Add Properties here</p>
          <div className="d-flex justify-content-center">
            <div className="col-6 mr-5">
              <TextBox
                label="Property Name"
                name="propertyName"
                value={propertyDetail.propertyName}
                onChange={handlePropertyChange}
              />
            </div>
            <div className="col-6">
              <TextBox
                label="description"
                name="description"
                value={propertyDetail.description}
                onChange={handlePropertyChange}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <div className="mr-5">
              <CustomButton
                label="Save"
                onClick={handleAddProperty}
                className="btn-primary"
              />
            </div>
            <div>
              <CustomButton
                label="Cancel"
                className="btn-secondary"
                onClick={handleCancelTwo}
              />
            </div>
          </div>
        </div>

        <div className="col-12 mt-5">
          <table className="table" border={1} width={"100%"}>
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {propertyList.map((ele, index) => {
                return (
                  <tr key={index}>
                    <td>{ele.propertyName}</td>
                    <td>{ele.description}</td>
                    <td>
                      <span
                        className="mr-5"
                        onClick={() => handleEdit(ele._id)}
                      >
                        <i className={ICONS.EDIT_ICON} />
                      </span>
                      <span onClick={() => handleDelete(ele._id)}>
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
    </>
  );
};

export default Properties;
