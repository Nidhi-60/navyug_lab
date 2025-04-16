import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import TextArea from "../common/TextArea";
import Button from "../common/Button";
import DropDown from "../common/DropDown";
import { ipcRenderer } from "electron";
import PartyDetailTable from "../component/PartyDetailTable";
import { toast } from "react-toastify";
import CustomModel from "../common/CustomModel";
import CustomButton from "../common/Button";
import SearchableDrop from "../common/SearchableDrop";
import partyDetailValidation from "../validation/partyDetail";

const PartyMaster = () => {
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

  useEffect(() => {
    ipcRenderer.send("partyDetail:load", search, searchText);

    ipcRenderer.on("partyDetail:success", (e, data) => {
      setPartyList(JSON.parse(data));
    });
  }, [search]);

  const refetchData = () => {
    ipcRenderer.send("partyDetail:load", search, searchText);

    ipcRenderer.on("partyDetail:success", (e, data) => {
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

    if (formValid) {
      if (editMode) {
        ipcRenderer.send("updatePartyDetail:load", partyDetail);

        ipcRenderer.on("updatePartyDetail:success", (e, data) => {
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
        ipcRenderer.send("addPartyDetail:load", partyDetail);

        ipcRenderer.on("addPartyDetail:success", (e, data) => {
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
    setSearchText(e.target.value);
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
  };

  const handleEdit = (e, id) => {
    let findEditData = partyList.find((ele) => ele._id === id);

    let accountFind = options.find((ele) => ele._id === findEditData.account);

    setEditMode(true);

    setPartyDetail({
      ...findEditData,
      account: { label: accountFind.name, value: accountFind._id },
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

    ipcRenderer.on("deletePartyDetail:success", (e, data) => {
      refetchData();
      toast.warning("Deleted Successfully.");
      setModelShow(!modelShow);
      setDeleteId("");
    });
  };

  const modelButtons = [
    {
      label: "Delete",
      action: handleDeleteRecord,
    },
    {
      label: "Cancel",
      action: handleModel,
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
      <div className="row m-1">
        <div className="col-6 detail-box">
          <div className="mb-2">
            <p className="detail-header">General Details</p>
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
              />
            </div>
          </div>
        </div>
        <div className="col-6 detail-box">
          <div>
            <p className="detail-header">Official Details</p>
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
              />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <div className="me-2">
          <CustomButton
            label={editMode ? "Update" : "Save"}
            onClick={handleOnSave}
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

      <div className="row mb-3">
        <div className="col">
          <TextBox
            name="search"
            onChange={handleSearchOnChange}
            value={searchText}
          />
        </div>
        <div className="col">
          <CustomButton
            label="Search"
            onClick={handleSearch}
            className="btn-secondary"
          />
        </div>
      </div>

      <div className="row m-1">
        <PartyDetailTable
          columns={columns}
          data={partyList}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
};

export default PartyMaster;
