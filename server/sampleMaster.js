const unitList = async (con, mainWindow) => {
  try {
    let qry = `select * from unit`;

    let result = await con.query(qry);

    mainWindow.webContents.send("unit:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const addUnit = async (con, mainWindow, data) => {
  const { unitName, _id } = data;

  try {
    let qry = `insert into unit (unitName, _id) values ('${unitName}', '${_id}')`;

    let result = await con.query(qry);

    mainWindow.webContents.send("addUnit:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const updateUnit = async (con, mainWindow, data) => {
  const { unitName, _id, uid } = data;

  try {
    let qry = `UPDATE unit SET unitName='${unitName}', _id='${_id}' WHERE uid=${uid}`;

    let result = await con.query(qry);

    mainWindow.webContents.send("updateUnit:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const deleteUnit = async (con, mainWindow, data) => {
  const { uid } = data;

  try {
    let qry = `DELETE FROM unit WHERE uid=${uid}`;

    let result = await con.query(qry);

    mainWindow.webContents.send("deleteUnit:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const sampleSearch = async (con, mainWindow) => {
  try {
    let qry = `select [sampleName],[_id] from sample ORDER BY sampleName ASC`;

    let result = await con.query(qry);

    mainWindow.webContents.send("sampleSearch:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const sampleList = async (con, mainWindow) => {
  try {
    let qry = `select * from sample ORDER BY sampleName ASC`;

    let result = await con.query(qry);

    mainWindow.webContents.send("sampleList:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const addSample = async (con, mainWindow, data) => {
  try {
    let { sampleName, description } = data;

    let findSampleQry = `SELECT sampleName FROM sample WHERE sampleName='${sampleName}'`;

    let queryRes = await con.query(findSampleQry);

    let parsedData = JSON.parse(JSON.stringify(queryRes));
    if (parsedData.length > 0) {
      mainWindow.webContents.send(
        "addSample:success",
        JSON.stringify({ success: false, msg: "sample already exists" })
      );
    } else {
      let qry = `insert into sample (sampleName, description) values ('${sampleName}', '${description}')`;

      let result = await con.query(qry);

      mainWindow.webContents.send(
        "addSample:success",
        JSON.stringify({ success: true })
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const updateSample = async (con, mainWindow, data) => {
  try {
    let { sampleName, description } = data;

    let qry = `UPDATE sample SET sampleName='${sampleName}', description='${description}' WHERE [_id]=${data._id};`;

    let result = await con.query(qry);

    mainWindow.webContents.send("updateSample:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const deleteSample = async (con, mainWindow, data) => {
  try {
    let qry = `DELETE FROM sample WHERE [_id]=${data._id}`;

    let result = await con.query(qry);

    mainWindow.webContents.send("deleteSample:success", JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
};

const updateProperty = async (con, mainWindow, data) => {
  try {
    let { propertyName, description } = data;

    let qry = `UPDATE sampleProperty SET propertyName='${propertyName}', description='${description}' WHERE [_id]=${data._id};`;

    let result = await con.query(qry);

    mainWindow.webContents.send(
      "updateProperty:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }
};

const deleteProperty = async (con, mainWindow, data) => {
  try {
    let qry = `DELETE FROM sampleProperty WHERE [_id]=${data._id}`;

    let result = await con.query(qry);

    mainWindow.webContents.send("deleteProperty:success", JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
};

const addSampleProperty = async (con, mainWindow, data) => {
  try {
    let { propertyName, description } = data;

    let findSampleQry = `SELECT propertyName FROM sampleProperty WHERE propertyName='${propertyName}'`;

    let queryRes = await con.query(findSampleQry);

    let parsedData = JSON.parse(JSON.stringify(queryRes));

    if (parsedData.length > 0) {
      mainWindow.webContents.send(
        "addProperty:success",
        JSON.stringify({ success: false, msg: "Property Already Exists." })
      );
    } else {
      let qry = `insert into sampleProperty (propertyName, description) values ('${propertyName}', '${description}')`;

      let result = await con.query(qry);

      mainWindow.webContents.send(
        "addProperty:success",
        JSON.stringify({ success: true })
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const getSampleProperty = async (con, mainWindow, data) => {
  try {
    //     let qry = `SELECT
    //     sp.propertyName,
    //     sp.description AS PropertyDescription,
    //     pm.pprice,
    //     pm.punit,
    //     pm.[_id]
    // FROM
    //     propertyMapping pm
    // INNER JOIN
    //     sampleProperty sp ON pm.[pid] = sp.[_id]
    // WHERE
    //     pm.[sid] = ${data};`;

    let qry = `SELECT 
    sp.[_id] AS propertyId, 
    sp.[propertyName], 
    sp.description AS propertyDescription,
    pm.pprice, 
    pm.punit,
    pm.[_id],
    pm.isDefault
FROM 
    propertyMapping pm
INNER JOIN 
    sampleProperty sp ON pm.[pid] = sp.[_id]  
WHERE 
    pm.[sid] = ${data}
    ORDER BY pm.[_id]
    `;

    let result = await con.query(qry);

    let updatedList = JSON.parse(JSON.stringify(result));

    let updatedResult = updatedList.map((ele) => {
      return {
        ...ele,
        isDefault: ele.isDefault === "0" ? false : true,
      };
    });

    mainWindow.webContents.send(
      "getSampleProperty:success",
      JSON.stringify(updatedResult)
    );
  } catch (e) {
    console.log(e);
  }
};

const sampleSearchProperty = async (con, mainWindow) => {
  try {
    let qry = `select [propertyName], [_id] from sampleProperty ORDER BY propertyName ASC`;

    let result = await con.query(qry);

    mainWindow.webContents.send(
      "sampleSearchProperty:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }
};

const addMapping = async (con, mainWindow, data) => {
  try {
    // let values = [];
    // data.forEach((ele) => {
    //   let val = Object.values(ele);
    //   values.push(val);
    // });

    // let queryValues = values.map((row) => `(${row.join(", ")})`).join(", ");

    // let queryValues = values
    //   .map((row) => `(${row.map((value) => `'${value}'`).join(", ")})`)
    //   .join(", ");

    let result;

    for (const row of data) {
      let qry = `insert into propertyMapping (sid, pid, punit, pprice, isDefault) values (${row.sid}, ${row.pid}, '${row.punit}', ${row.pprice}, ${row.isDefault});`;

      result = await con.query(qry);
    }

    // let qry = `insert into propertyMapping (sid, pid, punit, pprice) values ${queryValues};`;

    mainWindow.webContents.send("addMapping:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const propertyList = async (con, mainWindow) => {
  try {
    let qry = `select * from sampleProperty ORDER BY propertyName ASC`;

    let result = await con.query(qry);

    mainWindow.webContents.send("propertyList:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const deletePredefinedMapping = async (con, mainWindow, data) => {
  try {
    let qry = `delete from propertyMapping where [_id] = ${data._id}`;

    let result = await con.query(qry);

    mainWindow.webContents.send(
      "deletePredefinedMapping:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }

  // mainWindow.webContents.send(
  //   "deletePredefinedMapping:success",
  //   JSON.stringify(result)
  // );
};

module.exports = {
  unitList,
  sampleSearch,
  addSample,
  sampleSearchProperty,
  addSampleProperty,
  getSampleProperty,
  addMapping,
  sampleList,
  updateSample,
  deleteSample,
  propertyList,
  updateProperty,
  deleteProperty,
  deletePredefinedMapping,
  addUnit,
  updateUnit,
  deleteUnit,
};
