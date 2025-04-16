export const transactionValidation = (data) => {
  let formValid = true;
  const formError = {};

  const { billNo, sampleId, locationId, partyId } = data;

  if (!billNo) {
    formError.billNo = "*Bill No is required";
    formValid = false;
  }

  if (!sampleId) {
    formError.sampleId = "*Sample Id is required";
    formValid = false;
  }

  if (!locationId) {
    formError.locationId = "*Location Id is required";
    formValid = false;
  }

  if (!partyId) {
    formError.partyId = "*Party Id is required";
    formValid = false;
  }

  return { formValid, formError };
};
