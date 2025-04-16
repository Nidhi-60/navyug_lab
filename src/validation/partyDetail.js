const partyDetailValidation = (data) => {
  const formError = {};
  let formValid = true;

  const { companyName, account } = data;

  if (!companyName) {
    formError.companyName = "Company name is required";
    formValid = false;
  }

  if (!account) {
    formError.account = "Account is required";
    formValid = false;
  }

  return { formError, formValid };
};

export default partyDetailValidation;
