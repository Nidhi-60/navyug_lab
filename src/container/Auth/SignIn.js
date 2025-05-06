import React, { useState } from "react";
import TextBox from "../../common/TextBox";
import CustomButton from "../../common/Button";
import { ipcRenderer } from "electron";
import { login, logo, logo2 } from "../../assests/image";

const Signin = (props) => {
  const {
    signinDetail,
    handleTextChange,
    handleSignin,
    formError,
    handleSignupCancel,
  } = props;

  return (
    <div className="d-flex">
      <div>
        <img src={login} width="200px" />
      </div>
      <div className="form-center">
        <div className="form-main">
          <img src={logo2} className="login-logo" />
          <p className="text-header">Login</p>

          <form className="">
            <div className="form-group mb-5">
              <TextBox
                label="User Name"
                name="userName"
                value={signinDetail.userName}
                onChange={handleTextChange}
                formError={formError.userName}
              />
            </div>
            <div className="form-group mb-5">
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
              <CustomButton
                label="Login"
                onClick={handleSignin}
                className="mr-5"
              />
              <CustomButton
                label="Cancel"
                className="btn-secondary"
                onClick={handleSignupCancel}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
