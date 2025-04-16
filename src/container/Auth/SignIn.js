import React, { useState } from "react";
import TextBox from "../../common/TextBox";
import CustomButton from "../../common/Button";
import { ipcRenderer } from "electron";
import { logo, logo2 } from "../../assests/image";

const Signin = (props) => {
  const { signinDetail, handleTextChange, handleSignin, formError } = props;

  return (
    <div className="box-center glass-background">
      <img src={logo2} className="login-logo" />
      <p className="text-header">Login</p>

      <form>
        <div className="form-group mb-3">
          <TextBox
            label="User Name"
            name="userName"
            value={signinDetail.userName}
            onChange={handleTextChange}
            formError={formError.userName}
          />
        </div>
        <div className="form-group mb-3">
          <TextBox
            label="Password"
            type="password"
            name="password"
            value={signinDetail.password}
            onChange={handleTextChange}
            formError={formError.password}
          />
        </div>

        <div className="text-center">
          <CustomButton label="Login" onClick={handleSignin} />
        </div>
      </form>
    </div>
  );
};

export default Signin;
