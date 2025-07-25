import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import CustomButton from "../common/Button";
import SearchableDrop from "../common/SearchableDrop";
import { ipcRenderer } from "electron";
import { ICONS } from "../constant/icons";
import toast from "react-hot-toast";

const SampleMaster = (props) => {
  const { handleCancel } = props;
  const [unitOptions, setUnitOptions] = useState([]);
  const [sampleOptions, setSampleOptions] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const [searchPropertyList, setSearchPropertyList] = useState([]);
  const [newProperty, setNewProperty] = useState([]);
  const [newEditProperty, setNewEditPoperty] = useState({
    sid: "",
    pid: "",
    pprice: "",
    punit: "",
    isDefault: false,
  });

  const [currentSample, setCurrentSample] = useState("");

  useEffect(() => {
    ipcRenderer.send("unit:load");

    ipcRenderer.on("unit:success", (e, data) => {
      setUnitOptions(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    refetchSample();
  }, []);

  useEffect(() => {
    refetchProperty();
  }, []);

  const refetchSample = () => {
    ipcRenderer.send("sampleSearch:load");

    ipcRenderer.on("sampleSearch:success", (e, data) => {
      setSampleOptions(JSON.parse(data));
    });
  };

  const refetchProperty = () => {
    ipcRenderer.send("sampleSearchProperty:load");

    ipcRenderer.on("sampleSearchProperty:success", (e, data) => {
      setSearchPropertyList(JSON.parse(data));
    });
  };

  const handleSamplePropertyChange = (e) => {
    setCurrentSample(e);
    setNewProperty([]);
    ipcRenderer.send("getSampleProperty:load", e.value);

    ipcRenderer.on("getSampleProperty:success", (e, data) => {
      let parsedData = JSON.parse(data);
      setPropertyList(parsedData);
    });
  };

  const handleNewPropChange = (e, name) => {
    setNewEditPoperty({
      ...newEditProperty,
      [name]: e,
    });
  };

  const handleNewPropTextChange = (e) => {
    if (e.target.name === "isDefault") {
      setNewEditPoperty({
        ...newEditProperty,
        [e.target.name]: e.target.checked,
      });
    } else {
      setNewEditPoperty({
        ...newEditProperty,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAddNewProp = () => {
    let findProperty = propertyList.find((ele) => {
      return (
        ele.propertyId === newEditProperty.pid.value &&
        ele.pprice === newEditProperty.pprice &&
        ele.punit === newEditProperty.punit.value
      );
    });

    if (findProperty) {
      toast.error("Same Property with unit and price exists");
    } else {
      setNewProperty([
        ...newProperty,
        { ...newEditProperty, sid: currentSample.value },
      ]);
      setNewEditPoperty({
        sid: "",
        pid: "",
        pprice: "",
        punit: "",
        isDefault: false,
      });
    }
  };

  const propertyHeader = [
    { label: "Name", className: "col" },
    { label: "isDefault", className: "col" },
    { label: "Unit", className: "col" },
    { label: "Price", className: "col" },
  ];

  const handleSaveMapping = () => {
    let updatedProperty = newProperty.map((ele) => {
      return {
        sid: ele.sid,
        pid: ele.pid.value,
        punit: ele.punit.value,
        pprice: ele.pprice,
        isDefault: ele.isDefault,
      };
    });

    ipcRenderer.send("addMapping:load", updatedProperty);

    ipcRenderer.on("addMapping:success", (e, data) => {
      toast.success("Mapping Successfully.");
    });
  };

  const handleDeleteProperty = (e, pIndex) => {
    setNewProperty(newProperty.filter((ele, index) => index !== pIndex));
  };

  const handleDeletePreDefinedProperty = (e, data) => {
    let sendObj = {
      sid: currentSample.value,
      _id: data._id,
    };

    ipcRenderer.send("deletePredefinedMapping:load", sendObj);

    ipcRenderer.on("deletePredefinedMapping:success", (e, data) => {
      toast.success("Mapping Deleted Successfully.");

      let updatedPropertyList = propertyList.filter(
        (ele) => ele._id !== sendObj._id
      );

      setPropertyList(updatedPropertyList);
    });
  };

  return (
    <>
      <div>
        <p className="text-header">Mapping Property</p>
        <div className="d-flex">
          <div className="mapping-box">
            <SearchableDrop
              data={sampleOptions}
              label="Select Sample"
              handleChange={handleSamplePropertyChange}
              value={currentSample}
              width="450"
              mainClass="master-drop"
            />
          </div>

          <div className="" style={{ width: "70%" }}>
            <table className="table" width={100}>
              {(propertyList.length > 0 || newProperty.length > 0) && (
                <thead>
                  <tr>
                    {propertyHeader.map((ele, index) => {
                      return <th key={index}>{ele.label}</th>;
                    })}
                  </tr>
                </thead>
              )}
              <tbody>
                {propertyList.map((ele, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <TextBox
                          value={ele.propertyName}
                          width="300"
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={ele.isDefault}
                          readOnly
                        />
                      </td>
                      <td>
                        <TextBox value={ele.punit} width="300" readOnly />
                      </td>
                      <td>
                        <TextBox value={ele.pprice} width="100" readOnly />
                      </td>
                      <td>
                        <span
                          onClick={(e) =>
                            handleDeletePreDefinedProperty(e, ele)
                          }
                          className="cancel-position"
                        >
                          <i className={ICONS.CANCEL_ICON} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <table className="table">
              <tbody>
                {newProperty.map((ele, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <TextBox value={ele.pid.label} width="300" readOnly />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={ele.isDefault}
                          readOnly
                        />
                      </td>
                      <td>
                        <TextBox value={ele.punit.label} width="300" readOnly />
                      </td>
                      <td>
                        <TextBox value={ele.pprice} width="100" readOnly />
                      </td>

                      <td>
                        <span
                          onClick={(e) => handleDeleteProperty(e, index)}
                          className="cursor-pointer"
                        >
                          <i className={ICONS.CANCEL_ICON} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <table className="table">
              <thead>
                <tr>
                  {propertyHeader.map((ele, index) => {
                    return <th key={index}>{ele.label}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <SearchableDrop
                      data={searchPropertyList}
                      value={newEditProperty.pid}
                      name="pid"
                      handleChange={(e) => handleNewPropChange(e, "pid")}
                      width="300"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={newEditProperty.isDefault}
                      onChange={handleNewPropTextChange}
                    />
                  </td>

                  <td>
                    <SearchableDrop
                      data={unitOptions}
                      value={newEditProperty.punit}
                      name="punit"
                      handleChange={(e) => handleNewPropChange(e, "punit")}
                      width="300"
                    />
                  </td>
                  <td>
                    <TextBox
                      name="pprice"
                      value={newEditProperty.pprice}
                      onChange={handleNewPropTextChange}
                      width="100"
                      className="sample-text"
                    />
                  </td>
                  <td>
                    <span onClick={handleAddNewProp} className="f25">
                      <i className={ICONS.ADD_ICON} />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5">
          <div className="d-flex justify-content-center">
            <CustomButton
              label="Save Mapping"
              onClick={handleSaveMapping}
              className="mr-5 btn-primary"
            />

            <CustomButton
              label="Cancel"
              onClick={handleCancel}
              className="btn-secondary"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SampleMaster;
