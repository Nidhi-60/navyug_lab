const signinValidator = (data) => {
  let formValid = true;
  const formErrors = {};

  const { userName, password } = data;

  if (!userName) {
    formErrors.userName = "*Please enter your username";
    formValid = false;
  }

  if (!password) {
    formErrors.password = "*Please enter your password";
    formValid = false;
  }

  return { formValid, formErrors };
};

export default signinValidator;
