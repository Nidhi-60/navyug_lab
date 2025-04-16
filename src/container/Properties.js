import React, { useEffect, useState } from "react";
import CustomButton from "../common/Button";
import TextBox from "../common/TextBox";
import { ipcRenderer } from "electron";
import { toast } from "react-toastify";
import { ICONS } from "../constant/icons";

const Properties = () => {
  const [propertyDetail, setPropertyDetail] = useState({
    propertyName: "",
    description: "",
  });
  const [propertyList, setPropertyList] = useState([]);
  const [isedit, setIsEdit] = useState({
    flag: false,
    id: undefined,
  });

  const handlePropertyChange = (e) => {
    setPropertyDetail({ ...propertyDetail, [e.target.name]: e.target.value });
  };

  const handleAddProperty = () => {
    if (!isedit.flag) {
      ipcRenderer.send("addProperty:load", propertyDetail);

      ipcRenderer.on("addProperty:success", (e, data) => {
        toast.success("Property Added Successfully.");
      });
    } else {
      ipcRenderer.send("updateProperty:load", propertyDetail);

      ipcRenderer.on("updateProperty:success", (e, data) => {
        toast.success("Property Updated Successfully.");
      });
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

  const handleCancel = () => {
    setPropertyDetail({ description: "", propertyName: "" });
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
          <p className="detail-header">Add Properties here</p>
          <div className="row mb-2">
            <div className="col-6">
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
            <div className="me-2">
              <CustomButton label="Save" onClick={handleAddProperty} />
            </div>
            <div>
              <CustomButton
                label="Cancel"
                className="btn-secondary"
                onClick={handleCancel}
              />
            </div>
          </div>
        </div>

        <div className="col-12 mt-2">
          <table className="table">
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
                        className="me-2"
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
      </div>
    </>
  );
};

export default Properties;
