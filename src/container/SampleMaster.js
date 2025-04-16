import React, { useEffect, useState } from "react";
import TextBox from "../common/TextBox";
import CustomButton from "../common/Button";
import DropDown from "../common/DropDown";
import SearchableDrop from "../common/SearchableDrop";
import { ipcRenderer } from "electron";
import { toast } from "react-toastify";
import { ICONS } from "../constant/icons";

const SampleMaster = () => {
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

  console.log("property list", propertyList);

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
        <p className="detail-header">Mapping Property</p>
        <div className="row">
          <div className="col-4">
            <SearchableDrop
              data={sampleOptions}
              label="Select Sample"
              handleChange={handleSamplePropertyChange}
              value={currentSample}
            />
          </div>
          <div className="col-8">
            <table className="table mapping-table">
              <tbody>
                {newProperty.map((ele, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <TextBox value={ele.pid.label} />
                      </td>
                      <td>
                        <input type="checkbox" checked={ele.isDefault} />
                      </td>
                      <td>
                        <TextBox value={ele.punit.label} />
                      </td>
                      <td>
                        <TextBox value={ele.pprice} />
                      </td>

                      <td>
                        <span
                          onClick={(e) => handleDeleteProperty(e, index)}
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

            <table className="table mapping-table">
              <tbody>
                {propertyList.map((ele, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <TextBox value={ele.propertyName} />
                      </td>
                      <td>
                        <input type="checkbox" checked={ele.isDefault} />
                      </td>
                      <td>
                        <TextBox value={ele.punit} />
                      </td>
                      <td>
                        <TextBox value={ele.pprice} />
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
            <table className="table mapping-table">
              <thead>
                <tr>
                  {propertyHeader.map((ele) => {
                    return <th>{ele.label}</th>;
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
                    />
                  </td>
                  <td>
                    <TextBox
                      name="pprice"
                      value={newEditProperty.pprice}
                      onChange={handleNewPropTextChange}
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

        <div className="row mt-2">
          <div className="text-center  cursor-pointer">
            <CustomButton label="Save Mapping" onClick={handleSaveMapping} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SampleMaster;
