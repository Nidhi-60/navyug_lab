const unitList = async (con, mainWindow) => {
  try {
    let qry = `select * from unit`;

    let result = await con.query(qry);

    mainWindow.webContents.send("unit:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const sampleSearch = async (con, mainWindow) => {
  try {
    let qry = `select [sampleName],[_id] from sample`;

    let result = await con.query(qry);

    mainWindow.webContents.send("sampleSearch:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const sampleList = async (con, mainWindow) => {
  try {
    let qry = `select * from sample`;

    let result = await con.query(qry);

    mainWindow.webContents.send("sampleList:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const addSample = async (con, mainWindow, data) => {
  try {
    let { sampleName, description } = data;

    let qry = `insert into sample (sampleName, description) values ('${sampleName}', '${description}')`;

    let result = await con.query(qry);

    mainWindow.webContents.send("addSample:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const updateSample = async (con, mainWindow, data) => {
  try {
    let { sampleName, description } = data;

    let qry = `UPDATE sample SET sampleName='${sampleName}', description='${description}' WHERE [_id]=${data._id};`;

    console.log(qry);

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

    let qry = `insert into sampleProperty (propertyName, description) values ('${propertyName}', '${description}')`;

    let result = await con.query(qry);

    mainWindow.webContents.send("addProperty:success", JSON.stringify(result));
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
    let qry = `select [propertyName], [_id] from sampleProperty`;

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

    // console.log("query value", queryValues);

    let result;

    for (const row of data) {
      let qry = `insert into propertyMapping (sid, pid, punit, pprice, isDefault) values (${row.sid}, ${row.pid}, '${row.punit}', ${row.pprice}, ${row.isDefault});`;

      console.log("qry", qry);

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
    let qry = `select * from sampleProperty`;

    let result = await con.query(qry);

    mainWindow.webContents.send("propertyList:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const deletePredefinedMapping = async (con, mainWindow, data) => {
  try {
    let qry = `delete from propertyMapping where [_id] = ${data._id}`;

    console.log("qry", qry);

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
};
