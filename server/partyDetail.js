const list = async (con, searchText, search, mainWindow) => {
  try {
    let qry = "";

    if (search) {
      qry = `select * from partyDetail where 
                    companyName like '%${searchText}%' OR 
                    address like '%${searchText}%' or 
                    contactPersonName like '%${searchText}%' or
                    officeContactPerson like '%${searchText}%' or
                    stNo like '%${searchText}%' or
                    tdsNo like '%${searchText}%'
                    `;
    } else {
      qry = "select * from partyDetail ORDER BY companyName ASC";
    }

    const data = await con.query(qry);

    if (data) {
      mainWindow.webContents.send("partyDetail:success", JSON.stringify(data));
    }
  } catch (e) {
    console.log(e);
  }
};

const create = async (con, data, mainWindow) => {
  try {
    const {
      companyName,
      address,
      companyCity,
      contactNo,
      contactPersonName,
      contactPersonMobileNo,
      officeContactPerson,
      officeAddress,
      officeContactNo,
      account,
      stNo,
      tdsNo,
    } = data;

    let findUserQry = `SELECT companyName FROM partyDetail WHERE [companyName]='${companyName}'`;

    let userRes = await con.query(findUserQry);

    let userResponseParsed = JSON.parse(JSON.stringify(userRes));

    if (userResponseParsed.length > 0) {
      mainWindow.webContents.send(
        "addPartyDetail:success",
        JSON.stringify({ success: false, msg: "Name Already Exists" })
      );
    } else {
      let qry = `insert into partyDetail
             (companyName, address, companyCity, contactNo,
             contactPersonName, contactPersonMobileNo, officeContactPerson,
              officeAddress, officeContactNo, account, stNo, tdsNo)
              values('${companyName.replace(/'/g, "''")}',
                    '${address.replace(/'/g, "''")}',
                    '${companyCity.replace(/'/g, "''")}',
                    '${contactNo.replace(/'/g, "''")}',
                    '${contactPersonName.replace(/'/g, "''")}',
                    '${contactPersonMobileNo.replace(/'/g, "''")}',
                    '${officeContactPerson.replace(/'/g, "''")}',
                    '${officeAddress.replace(/'/g, "''")}',
                    '${officeContactNo.replace(/'/g, "''")}',
                    '${account.value.replace(/'/g, "''")}',
                    '${stNo.replace(/'/g, "''")}',
                    '${tdsNo.replace(/'/g, "''")}')`;
      const result = await con.query(qry);
      mainWindow.webContents.send(
        "addPartyDetail:success",
        JSON.stringify({ success: true })
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const update = async (con, data, mainWindow) => {
  try {
    const {
      companyName,
      address,
      companyCity,
      contactNo,
      contactPersonName,
      contactPersonMobileNo,
      officeContactPerson,
      officeAddress,
      officeContactNo,
      account,
      stNo,
      tdsNo,
      _id,
    } = data;

    let updates = {
      companyName: companyName,
      address: address,
      companyCity: companyCity,
      contactNo: contactNo,
      contactPersonName: contactPersonName,
      contactPersonMobileNo: contactPersonMobileNo,
      officeContacterson: officeContactPerson,
      officeAddress: officeAddress,
      officeContactNo: officeContactNo,
      account: account.value,
      stNo: stNo,
      tdsNo: tdsNo,
    };

    let setClauses = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && value !== "") {
        setClauses.push(`${key}='${value}'`);
      }
    }

    let setClause = setClauses.join(", ");

    let qry = `UPDATE partyDetail SET ${setClause} WHERE [_id]=${_id};`;

    const result = await con.query(qry);

    mainWindow.webContents.send(
      "updatePartyDetail:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }
};

const deleteRecord = async (con, data, mainWindow) => {
  try {
    let qry = `delete from partyDetail where [_id]=${data}`;

    const result = await con.query(qry);

    mainWindow.webContents.send(
      "deletePartyDetail:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }
};

const searchParty = async (con, mainWindow) => {
  try {
    let qry = `select [companyName],[_id],[account] from partyDetail ORDER BY companyName ASC`;

    let result = await con.query(qry);

    mainWindow.webContents.send("searchParty:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const getPartyAddress = async (con, mainWindow, data) => {
  try {
    console.log("data", data);

    let qry = `select [address] from partyDetail WHERE [_id] = ${data}`;

    let result = await con.query(qry);

    mainWindow.webContents.send(
      "companySearch:success",
      JSON.stringify(result)
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  list,
  create,
  update,
  deleteRecord,
  searchParty,
  getPartyAddress,
};
