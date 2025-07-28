import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import TextArea from "../common/TextArea";
import { ipcRenderer } from "electron";
import PartyDetailTable from "../component/PartyDetailTable";
import CustomModel from "../common/CustomModel";
import CustomButton from "../common/Button";
import SearchableDrop from "../common/SearchableDrop";
import partyDetailValidation from "../validation/partyDetail";
import { strUpperCase } from "../utils/strUpperCase";
import ReactPaginate from "react-paginate";
import usePagination from "../hooks/usePagination";
import toast from "react-hot-toast";

const PartyMaster = (props) => {
  const { handleCancel } = props;
  const [partyDetail, setPartyDetail] = useState({
    companyName: "",
    address: "",
    companyCity: "",
    contactNo: "",
    contactPersonName: "",
    contactPersonMobileNo: "",
    officeContactPerson: "",
    officeAddress: "",
    officeContactNo: "",
    account: "",
    stNo: "",
    tdsNo: "",
  });
  const [partyList, setPartyList] = useState([]);
  const [search, setSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [modelShow, setModelShow] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [formError, setFormError] = useState({});
  const [handlePageClick, currentItems, pageCount] = usePagination(
    10,
    partyList
  );

  useEffect(() => {
    ipcRenderer.send("partyDetail:load", search, searchText);

    ipcRenderer.once("partyDetail:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, [search]);

  const refetchData = () => {
    ipcRenderer.send("partyDetail:load", search, searchText);

    ipcRenderer.once("partyDetail:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  };

  const options = [
    { _id: "N", name: "N" },
    { _id: "Y", name: "Y" },
  ];

  const handleTextChange = (e) => {
    setPartyDetail({
      ...partyDetail,
      [e.target.name]: e.target.value,
    });
    setFormError({ ...formError, [e.target.name]: "" });
  };

  const handleDropChange = (e, name) => {
    setFormError({ ...formError, [name]: "" });
    setPartyDetail({
      ...partyDetail,
      [name]: e,
    });
  };

  const handleOnSave = () => {
    const { formError, formValid } = partyDetailValidation(partyDetail);

    let formatePartyDetail = {
      ...partyDetail,
      companyName: strUpperCase(partyDetail.companyName),
      companyCity: strUpperCase(partyDetail.companyCity),
      address: strUpperCase(partyDetail.address),
      contactPersonName: strUpperCase(partyDetail.contactPersonName),
      officeContactPerson: strUpperCase(partyDetail.officeContactPerson),
      officeAddress: strUpperCase(partyDetail.officeAddress),
    };

    if (formValid) {
      if (editMode) {
        ipcRenderer.send("updatePartyDetail:load", formatePartyDetail);

        ipcRenderer.once("updatePartyDetail:success", (e, data) => {
          refetchData();
          toast.success("Detail Updated Successfully.");

          setEditMode(false);
          setPartyDetail({
            companyName: "",
            address: "",
            companyCity: "",
            contactNo: "",
            contactPersonName: "",
            contactPersonMobileNo: "",
            officeContactPerson: "",
            officeAddress: "",
            officeContactNo: "",
            account: "",
            stNo: "",
            tdsNo: "",
          });
        });
      } else {
        ipcRenderer.send("addPartyDetail:load", formatePartyDetail);

        ipcRenderer.once("addPartyDetail:success", (e, data) => {
          let parsedData = JSON.parse(data);
          if (parsedData.success) {
            toast.success("Detail added Successfully.");
            refetchData();
            setPartyDetail({
              companyName: "",
              address: "",
              companyCity: "",
              contactNo: "",
              contactPersonName: "",
              contactPersonMobileNo: "",
              officeContactPerson: "",
              officeAddress: "",
              officeContactNo: "",
              account: "",
              stNo: "",
              tdsNo: "",
            });
          } else {
            toast.error(parsedData.msg);
          }
        });
      }
    } else {
      setFormError(formError);
    }
  };

  const columns = [
    "Company Name",
    "Address",
    "Company City",
    "Contact No",
    "Contact Person Name",
    "Contact Person Mobile No",
    "Contact Person",
    "Office Address",
    "Contact No",
    "A/C",
    "S/T No",
    "TDS No",
    "Actions",
  ];

  const handleSearchOnChange = (e) => {
    if (e.target.value === "") {
      handleSearch();
      setSearchText(e.target.value);
    } else {
      setSearchText(e.target.value);
    }
  };

  const handleSearch = () => {
    setSearch(!search);
  };

  const handleClose = () => {
    setSearch(!search);
    setSearchText("");
    setEditMode(false);

    setPartyDetail({
      companyName: "",
      address: "",
      companyCity: "",
      contactNo: "",
      contactPersonName: "",
      contactPersonMobileNo: "",
      officeContactPerson: "",
      officeAddress: "",
      officeContactNo: "",
      account: "",
      stNo: "",
      tdsNo: "",
    });
    handleCancel();
  };

  const handleEdit = (e, id) => {
    let findEditData = partyList.find((ele) => ele._id === id);

    let accountFind = options.find((ele) => ele._id === findEditData.account);

    setEditMode(true);

    setPartyDetail({
      ...findEditData,
      account: { label: accountFind?.name, value: accountFind?._id },
    });
  };

  const handleDelete = (e, id) => {
    setModelShow(true);
    setDeleteId(id);
  };

  const handleModel = () => {
    setModelShow(!modelShow);
  };

  const handleDeleteRecord = () => {
    ipcRenderer.send("deleteParyDetail:load", deleteId);

    ipcRenderer.once("deletePartyDetail:success", (e, data) => {
      refetchData();
      toast.error("Deleted Successfully.");
      setModelShow(!modelShow);
      setDeleteId("");
    });
  };

  const modelButtons = [
    {
      label: "Delete",
      action: handleDeleteRecord,
      className: "btn-primary mr-5",
    },
    {
      label: "Cancel",
      action: handleModel,
      className: "btn-secondary",
    },
  ];

  return (
    <>
      <CustomModel
        title="Delete"
        message="Are You Sure You Want To Delete?"
        show={modelShow}
        handleClose={handleModel}
        button={modelButtons}
      />
      <div className="row m-1 d-flex">
        <div className="col-6 detail-box">
          <div className="mb-2">
            <p className="text-header">General Details</p>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Company Name :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="companyName"
                value={partyDetail.companyName}
                onChange={handleTextChange}
                formError={formError.companyName}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Company Address :</label>
            </div>
            <div className="col-9">
              <TextArea
                name="address"
                value={partyDetail.address}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Company City :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="companyCity"
                value={partyDetail.companyCity}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Company No :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="contactNo"
                value={partyDetail.contactNo}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Contact Person Name :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="contactPersonName"
                value={partyDetail.contactPersonName}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Contact Person Mobile No :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="contactPersonMobileNo"
                value={partyDetail.contactPersonMobileNo}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
        </div>
        <div className="col-6 detail-box">
          <div>
            <p className="text-header">Official Details</p>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Contact Person :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="officeContactPerson"
                value={partyDetail.officeContactPerson}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Office Address :</label>
            </div>
            <div className="col-9">
              <TextArea
                name="officeAddress"
                value={partyDetail.officeAddress}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>Contact No :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="officeContactNo"
                value={partyDetail.officeContactNo}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>A/C :</label>
            </div>
            <div className="col-9">
              <SearchableDrop
                data={options}
                handleChange={(e) => handleDropChange(e, "account")}
                name="account"
                value={partyDetail.account}
                formError={formError.account}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>S T No :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="stNo"
                value={partyDetail.stNo}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
          <div className="mb-2 row">
            <div className="col-3">
              <label>TDS No :</label>
            </div>
            <div className="col-9">
              <TextBox
                name="tdsNo"
                value={partyDetail.tdsNo}
                onChange={handleTextChange}
                width="500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mb-5">
        <div className="me-2 mr-5">
          <CustomButton
            label={editMode ? "Update" : "Save"}
            onClick={handleOnSave}
            className="btn-primary"
          />
        </div>

        <div className="">
          <CustomButton
            label="Cancel"
            onClick={handleClose}
            className="btn-secondary"
          />
        </div>
      </div>

      <div className="d-flex">
        <div className="col">
          <TextBox
            name="search"
            onChange={handleSearchOnChange}
            value={searchText}
          />
        </div>
        <div className="ml-5">
          <CustomButton
            label="Search"
            onClick={handleSearch}
            className="btn-secondary"
          />
        </div>
      </div>

      <div className="row mt-5">
        <PartyDetailTable
          columns={columns}
          // data={currentItems}
          data={partyList}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
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
    </>
  );
};

export default PartyMaster;
