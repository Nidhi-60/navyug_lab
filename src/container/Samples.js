import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import { ipcRenderer } from "electron";
import CustomButton from "../common/Button";
import { ICONS } from "../constant/icons";
import { strUpperCase } from "../utils/strUpperCase";

import usePagination from "../hooks/usePagination";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";

const Samples = (props) => {
  const { handleCancel } = props;
  const [sampleDetail, setSampleDetail] = useState({
    sampleName: "",
    description: "",
  });
  const [sampleList, setSampleList] = useState([]);
  const [handlePageClick, currentItems, pageCount] = usePagination(
    10,
    sampleList
  );
  const [isedit, setIsEdit] = useState({
    flag: false,
    id: undefined,
  });

  const handleSampleChange = (e) => {
    setSampleDetail({ ...sampleDetail, [e.target.name]: e.target.value });
  };

  const handleAddSample = () => {
    let formatedData = {
      ...sampleDetail,
      sampleName: strUpperCase(sampleDetail.sampleName),
      description: strUpperCase(sampleDetail.description),
    };

    if (!isedit.flag) {
      ipcRenderer.send("addSample:load", formatedData);

      ipcRenderer.once("addSample:success", (e, data) => {
        let parsedData = JSON.parse(data);

        if (parsedData.success) {
          toast.success("Sample added Successfully.");
          refetchSample();

          setSampleDetail({
            sampleName: "",
            description: "",
          });

          setIsEdit({
            flag: false,
            id: undefined,
          });
        } else {
          toast.error(parsedData.msg);
        }
      });
    } else {
      ipcRenderer.send("updateSample:load", formatedData);

      ipcRenderer.once("updateSample:success", (e, data) => {
        toast.success("Sample Updated Successfully.");
        refetchSample();

        setSampleDetail({
          sampleName: "",
          description: "",
        });

        setIsEdit({
          flag: false,
          id: undefined,
        });
      });
    }
  };

  useEffect(() => {
    refetchSample();
  }, []);

  const refetchSample = () => {
    ipcRenderer.send("sampleList:load");

    ipcRenderer.once("sampleList:success", (e, data) => {
      setSampleList(JSON.parse(data));
    });
  };

  const handleCancelTwo = () => {
    handleCancel();
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
    ipcRenderer.once("deleteSample:success", (e, data) => {
      toast.success("Sample Deleted Successfully.");
      refetchSample();
    });
  };

  return (
    <div className="row">
      <div className="col-12">
        <p className="text-header">Add Samples here</p>
        <div className="d-flex justify-content-center">
          <div className="col-6 mr-5">
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
          <div className="mr-5 cursor-pointer">
            <CustomButton
              label={isedit.flag ? "Update" : "Save"}
              onClick={handleAddSample}
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

      <div className="d-flex justify-content-center mt-5">
        <table className="table" border={1} width={"100%"}>
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

export default Samples;
