// import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./assests/css/index.css";
import "./assests/fonts/recog-icon/style.css";
import { ipcRenderer } from "electron";
import React, { useEffect, useState } from "react";
import PartyMaster from "./container/PartyMaster";
import SampleMaster from "./container/SampleMaster";
import SampleTransaction from "./container/SampleTransaction";
import Signin from "./container/Auth/SignIn";
import { toast, ToastContainer } from "react-toastify";
import BillShow from "./container/BillShow";
import CustomReport from "./container/CustomReport";
import signinValidator from "./validation/signin";
import AddressPrint from "./container/AddressPrint";
import Samples from "./container/Samples";
import Properties from "./container/Properties";

const App = () => {
  const [currentPage, setCurrentPage] = useState("signIn");
  const [formError, setFormError] = useState({});
  let displayBlock = "";
  let userData = JSON.parse(localStorage.getItem("user"));
  let isAuth = false;

  ipcRenderer.on("menu", (e, data) => {
    setCurrentPage(data.LABEL);
  });

  ipcRenderer.on("logout", (e) => {
    localStorage.clear();
  });

  useEffect(() => {
    if (userData) {
      // setCurrentPage("sampleTransaction");
      isAuth = true;
      ipcRenderer.send("setUser:load", userData);
    }
  }, [userData]);

  useEffect(() => {
    if (isAuth) {
      // setCurrentPage("sampleTransaction");
      setCurrentPage("sampleTransaction");
    }
  }, [isAuth]);

  const [signinDetail, setSigninDetail] = useState({
    userName: "",
    password: "",
  });

  const handleTextChange = (e) => {
    setSigninDetail({ ...signinDetail, [e.target.name]: e.target.value });
    setFormError({ ...formError, [e.target.name]: "" });
  };

  const handleSignin = () => {
    const { formErrors, formValid } = signinValidator(signinDetail);

    if (formValid) {
      ipcRenderer.send("signin:load", signinDetail);

      ipcRenderer.on("signin:success", (e, data) => {
        // toast.success("login Success.");
        let result = JSON.parse(data);

        if (result.success) {
          console.log(result);
          let userData = result.result[0];
          localStorage.setItem("user", JSON.stringify(userData));
          setCurrentPage("sampleTransaction");
        }
      });
    } else {
      setFormError(formErrors);
    }
  };

  switch (currentPage) {
    case "signIn":
      displayBlock = (
        <Signin
          signinDetail={signinDetail}
          handleTextChange={handleTextChange}
          handleSignin={handleSignin}
          formError={formError}
        />
      );
      break;
    case "partyMaster":
      displayBlock = <PartyMaster />;
      break;
    case "samples":
      displayBlock = <Samples />;
      break;
    case "properties":
      displayBlock = <Properties />;
      break;
    case "sampleMaster":
      displayBlock = <SampleMaster />;
      break;
    case "sampleTransaction":
      displayBlock = <SampleTransaction />;
      break;
    case "customReport":
      displayBlock = <CustomReport />;
      break;
    case "billShow":
      displayBlock = <BillShow />;
      break;
    case "addressPrint":
      displayBlock = <AddressPrint />;
      break;
  }

  return (
    <>
      <ToastContainer limit={1} />
      <div className="container-fluid">{displayBlock}</div>
    </>
  );
};

export default App;
