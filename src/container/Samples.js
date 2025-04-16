import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import { ipcRenderer } from "electron";
import CustomButton from "../common/Button";
import { toast } from "react-toastify";
import { ICONS } from "../constant/icons";

const Samples = () => {
  const [sampleDetail, setSampleDetail] = useState({
    sampleName: "",
    description: "",
  });
  const [sampleList, setSampleList] = useState([]);
  const [isedit, setIsEdit] = useState({
    flag: false,
    id: undefined,
  });

  const handleSampleChange = (e) => {
    setSampleDetail({ ...sampleDetail, [e.target.name]: e.target.value });
  };

  const handleAddSample = () => {
    if (!isedit.flag) {
      ipcRenderer.send("addSample:load", sampleDetail);

      ipcRenderer.on("addSample:success", (e, data) => {
        toast.success("Sample Added Successfully.");
      });
    } else {
      ipcRenderer.send("updateSample:load", sampleDetail);

      ipcRenderer.on("updateSample:success", (e, data) => {
        toast.success("Sample Updated Successfully.");
      });
    }

    setSampleDetail({
      sampleName: "",
      description: "",
    });
    refetchSample();

    setIsEdit({
      flag: false,
      id: undefined,
    });
  };

  useEffect(() => {
    refetchSample();
  }, []);

  const refetchSample = () => {
    ipcRenderer.send("sampleList:load");

    ipcRenderer.on("sampleList:success", (e, data) => {
      setSampleList(JSON.parse(data));
    });
  };

  const handleCancel = () => {
    setSampleDetail({ description: "", sampleName: "" });
  };

  const handleEdit = (id) => {
    setIsEdit({
      flag: true,
      id: id,
    });
    let findedSample = sampleList.find((sample) => sample._id === id);

    setSampleDetail(findedSample);
  };

  const handleDelete = (id) => {
    ipcRenderer.send("deleteSample:load", { _id: id });
    ipcRenderer.on("deleteSample:success", (e, data) => {
      toast.success("Sample Deleted Successfully.");
      refetchSample();
    });
  };

  return (
    <div className="row">
      <div className="col-12">
        <p className="detail-header">Add Samples here</p>
        <div className="row mb-2">
          <div className="col-6">
            <TextBox
              label="Sample Name"
              name="sampleName"
              value={sampleDetail.sampleName}
              onChange={handleSampleChange}
            />
          </div>
          <div className="col-6">
            <TextBox
              label="description"
              name="description"
              value={sampleDetail.description}
              onChange={handleSampleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <div className="me-2 cursor-pointer">
            <CustomButton label="Save" onClick={handleAddSample} />
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
              <th>Sample Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleList.map((sample, index) => {
              return (
                <tr key={index}>
                  <td>{sample.sampleName}</td>
                  <td>{sample.description}</td>
                  <td>
                    <span
                      className="me-2"
                      onClick={() => handleEdit(sample._id)}
                    >
                      <i className={ICONS.EDIT_ICON} />
                    </span>
                    <span onClick={() => handleDelete(sample._id)}>
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
  );
};

export default Samples;
