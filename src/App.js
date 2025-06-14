import "./assests/css/app.css";
import "./assests/fonts/recog-icon/style.css";
import { ipcRenderer } from "electron";
import React, { useEffect, useState } from "react";
import PartyMaster from "./container/PartyMaster";
import SampleMaster from "./container/SampleMaster";
import SampleTransaction from "./container/SampleTransaction";
import Signin from "./container/Auth/SignIn";

import BillShow from "./container/BillShow";
import CustomReport from "./container/CustomReport";
import signinValidator from "./validation/signin";
import AddressPrint from "./container/AddressPrint";
import Samples from "./container/Samples";
import Properties from "./container/Properties";
import Home from "./container/Home";
import Unit from "./container/Unit";
import { Toaster } from "react-hot-toast";
import PrintBlock from "./container/PrintBlock";

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
      setCurrentPage("billShow");
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

  const handleSignin = (e) => {
    e.preventDefault();
    const { formErrors, formValid } = signinValidator(signinDetail);

    if (formValid) {
      ipcRenderer.send("signin:load", signinDetail);

      ipcRenderer.on("signin:success", (e, data) => {
        let result = JSON.parse(data);

        if (result.success) {
          let userData = result.result[0];
          localStorage.setItem("user", JSON.stringify(userData));
          ipcRenderer.send("setUser:load", userData);
          setCurrentPage("home");
        }
      });
    } else {
      setFormError(formErrors);
    }
  };

  const handleSignupCancel = () => {
    setSigninDetail({ userName: "", password: "" });
  };

  const handleCancel = () => {
    setCurrentPage("home");
  };

  switch (currentPage) {
    case "signIn":
      displayBlock = (
        <Signin
          signinDetail={signinDetail}
          handleTextChange={handleTextChange}
          handleSignin={handleSignin}
          formError={formError}
          handleSignupCancel={handleSignupCancel}
        />
      );
      break;
    case "home":
      displayBlock = <Home />;
      break;
    case "partyMaster":
      displayBlock = <PartyMaster handleCancel={handleCancel} />;
      break;
    case "samples":
      displayBlock = <Samples handleCancel={handleCancel} />;
      break;
    case "properties":
      displayBlock = <Properties handleCancel={handleCancel} />;
      break;
    case "sampleMaster":
      displayBlock = <SampleMaster handleCancel={handleCancel} />;
      break;
    case "sampleTransaction":
      displayBlock = <SampleTransaction handleCancel={handleCancel} />;
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
    case "unit":
      displayBlock = <Unit handleCancel={handleCancel} />;
      break;
    case "print":
      displayBlock = <PrintBlock />;
      break;
  }

  return (
    <>
      <Toaster limit={1} position="bottom-right" />
      <div className="container-fluid">{displayBlock}</div>
    </>
  );
};

export default App;
