const addResult = async (con, mainWindow, data) => {
  try {
    let { billId, propertyId, result, createdAt } = data;

    let qry = `insert into sampleResults (billId, propertyId, result, createdAt) values 
              ('${billId}', '${propertyId}', '${result}', '${createdAt}')`;

    let results = await con.query(qry);

    mainWindow.webContents.send(
      "saveTestResult:success",
      JSON.stringify(results)
    );
  } catch (e) {
    console.log(e);
  }
};

const updateResult = async (con, mainWindow, data) => {
  try {
    let { result, resultId, transactionProperyId } = data;

    console.log("result", data);

    let qry = `UPDATE sampleResults SET result='${result}' WHERE [_id]=${resultId} AND [transactionPropertyId]=${transactionProperyId};`;

    console.log("qry", qry);

    let results = await con.query(qry);

    mainWindow.webContents.send(
      "updateResult:success",
      JSON.stringify(results)
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = { addResult, updateResult };
