const moment = require("moment");

const addTransaction = async (con, mainWindow, data) => {
  try {
    let { billNo, createdAt, sampleId, partyId, locationId, propertyList } =
      data;

    let qry = `insert into sampleTransaction (billNo, createdAt, sampleId, partyId, locationId, paid) values
            (${billNo}, '${createdAt}', ${sampleId}, ${partyId}, ${locationId}, ${propertyList[0].paid})`;

    let result = await con.query(qry);

    let billIdData = await con.query("SELECT @@IDENTITY AS lastId");

    for (const row of propertyList) {
      let qry2 = `insert into transactionProperties (billNo, createdAt, sampleId, pid, price, unit, remark, paid) values (${billNo}, #${createdAt}#, ${sampleId}, ${row.pid}, '${row.price}', '${row.unit}', '${row.remark}', ${row.paid})`;

      let result2 = await con.query(qry2);

      let propertyLastId = await con.query("SELECT @@IDENTITY AS lastId");

      let transactionResultQry = `insert into sampleResults (billId, propertyId, createdAt, transactionPropertyId) values
      ('${billIdData[0].lastId}', '${row.pid}', '${createdAt}', '${propertyLastId[0].lastId}')`;

      let transactionResult = await con.query(transactionResultQry);
    }

    // let qry2 = `insert into transactionProperties (billNo, createdAt, sampleId, pid, price, unit, remark) values ${values};`;

    mainWindow.webContents.send("addBill:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

const updateTransaction = async (con, mainWindow, data) => {
  try {
    let {
      billNo,
      createdAt,
      sampleId,
      partyId,
      locationId,
      propertyList,
      transactionId,
    } = data.updateSave;
    let { newEdit } = data;

    // main transaction update
    let qry = `UPDATE sampleTransaction SET
    sampleId=${sampleId},
    partyId=${partyId},
    locationId=${locationId},
    paid=${propertyList[0].paid} WHERE [_id]=${transactionId}`;

    let result = await con.query(qry);

    for (const row of propertyList) {
      try {
        let samplePropertiesQuery = `UPDATE transactionProperties
        SET price='${row.price}',
        unit='${row.unit}',
        remark='${row.remark}',
        paid=${row.paid}
        WHERE [billNo]=${billNo} AND [pid]=${row.pid} AND [_id]=${row.transactionProperyId}`;

        let result2 = await con.query(samplePropertiesQuery);
      } catch (e) {
        console.log("e transaction properties error", e);
      }
    }

    if (newEdit.length > 0) {
      for (let row of newEdit) {
        let qry2 = `insert into transactionProperties (billNo, createdAt, sampleId, pid, price, unit, remark, paid) values (${billNo}, #${createdAt}#, ${sampleId}, ${row.pid}, '${row.price}', '${row.unit}', '${row.remark}', ${row.paid})`;

        let result3 = await con.query(qry2);
        let propertyLastId = await con.query("SELECT @@IDENTITY AS lastId");
        let transactionResultQry = `insert into sampleResults (billId, propertyId, createdAt, transactionPropertyId) values
        ('${transactionId}', '${row.pid}', '${createdAt}', '${propertyLastId[0].lastId}')`;
        let transactionResult = await con.query(transactionResultQry);
      }
    }

    mainWindow.webContents.send(
      "updateBill:success",
      JSON.stringify({ success: true })
    );
  } catch (e) {
    console.log("e sample transaction error", e);
  }
};

const deleteDefaultProperty = async (con, mainWindow, data) => {
  try {
    console.log("data inside try", data);
    const { billNo, transactionId, transactionPropertyId, pid, resultId } =
      data;

    let transactionProertyQuery = `DELETE FROM transactionProperties WHERE [_id]=${transactionPropertyId}`;

    console.log("transactionProertyQuery", transactionProertyQuery);

    let res = await con.query(transactionProertyQuery);

    let propertyResultQuery = `DELETE FROM sampleResults WHERE [_id]=${resultId}`;

    console.log("propertyResultQuery", propertyResultQuery);

    let resultRes = await con.query(propertyResultQuery);

    mainWindow.webContents.send(
      "deleteDefautProperty:success",
      JSON.stringify({ success: true })
    );
  } catch (e) {
    console.log("e", e);
  }
};

const listTransaction = async (con, mainWindow, data) => {
  try {
    // console.log("date", data);

    let updatedData = moment(data).format("MM/DD/YYYY");
    // let updatedData = moment("2025-04-05T11:45:06.606Z").format("MM/DD/YYYY");

    let qry = `SELECT
      t.[billNo],
      t.[_id] AS transactionId,
      t.[createdAt],
      t.[paid],
      p.[_id] AS partiesId,
      p.[companyName],
      p.[account],
      s.[sampleName],
      l.[location] AS locationName,
      tp.[pid] AS transactionPropery,
      tp.[_id] AS transactionProperyId,
      tp.[remark],
      tp.[sampleId],
      pm.[pprice],
      pm.[punit],
      sp.[propertyName]
    FROM
        (((((([sampleTransaction] t
           INNER JOIN [partyDetail] p ON t.[partyId] = p.[_id])
            INNER JOIN [sample] s ON t.[sampleId] = s.[_id])
            INNER JOIN [location] l ON t.[locationId] = l.[_id])
            INNER JOIN [transactionProperties] tp ON t.[billNo] = tp.[billNo] AND t.[createdAt] = tp.[createdAt])
            INNER JOIN [propertyMapping] pm ON tp.[pid] = pm.[pid] AND tp.[sampleId] = pm.[sid] AND tp.[price] = pm.[pprice])   
            INNER JOIN [sampleProperty] sp ON sp.[_id] = pm.[pid])     
    WHERE
        t.[createdAt] = #${updatedData}# ORDER BY tp.[_id] ASC;`;

    let testQry = await con.query(qry);

    let getResults = "select * from sampleResults";

    let resultQuery = await con.query(getResults);

    // console.log("search result", JSON.parse(JSON.stringify(resultQuery)));

    const groupedData = Object.values(
      testQry.reduce((acc, item) => {
        if (!acc[item.billNo]) {
          acc[item.billNo] = {
            billNo: item.billNo,
            transactionId: item.transactionId,
            createdAt: item.createdAt,
            // paid: item.paid,
            partiesId: item.partiesId,
            companyName: item.companyName,
            account: item.account,
            sampleName: item.sampleName,
            locationName: item.locationName,
            sampleId: item.sampleId,
            properties: [],
          };
        }

        // let resultData = resultQuery.find(
        //   (ele) =>
        //     item.transactionId === ele.billId &&
        //     item.transactionPropery === ele.propertyId &&
        //     item.transactionPropertyId === ele.transactionPropertyId
        // );

        let resultData = resultQuery.find((ele) => {
          return (
            item.transactionId === ele.billId &&
            item.transactionPropery === ele.propertyId &&
            item.transactionProperyId === ele.transactionPropertyId
          );
        });

        // console.log("result data", resultData);

        acc[item.billNo].properties.push({
          pid: item.transactionPropery,
          price: item.pprice,
          punit: item.punit,
          propertyName: item.propertyName,
          result: resultData && resultData.result,
          resultId: resultData && resultData._id,
          remark: item.remark,
          transactionProperyId: resultData && resultData.transactionPropertyId,
          paid: item.paid === "0" ? false : true,
        });

        return acc;
      }, {})
    );

    //     let qry = `SELECT
    //     t.[billNo],
    //     t.[_id] AS transactionId,
    //     t.[createdAt],
    //     t.[sampleId],
    //     t.[locationId],
    //     t.[paid],
    //     p.[_id] AS partiesId,
    //     p.[companyName],
    //     p.[address],
    //     p.[account],
    //     l.[_id] AS locationsId,
    //     l.[location] AS locationName,
    //     s.[sampleName],
    //     sp.[propertyName],
    //     sp.[description] AS PropertyDescription,
    //     pm.[pprice],
    //     pm.[punit],
    //     pm.[_id] AS propertyMappingId,
    //     pm.[pid] AS propertiesId
    // FROM
    //     (((([sampleTransaction] t
    //     INNER JOIN [partyDetail] p ON t.[partyId] = p.[_id])
    //     INNER JOIN [location] l ON t.[locationId] = l.[_id])
    //     INNER JOIN [sample] s ON t.[sampleId] = s.[_id])
    //     LEFT JOIN [propertyMapping] pm ON t.[sampleId] = pm.[sid])
    //     LEFT JOIN [sampleProperty] sp ON pm.[pid] = sp.[_id]
    // WHERE
    //     t.[createdAt] = #${updatedData}#;
    // `;

    // let testQry = await con.query(qry);

    //     console.log("test query", JSON.parse(JSON.stringify(testQry)));

    //     let getResults = "select * from sampleResults";

    //     let resultQuery = await con.query(getResults);

    //     const groupedResults = testQry.reduce((acc, row) => {
    //       let bill = acc.find((item) => item.billNo === row.billNo);

    //       if (!bill) {
    //         bill = {
    //           transactionId: row.transactionId,
    //           billNo: row.billNo,
    //           createdAt: row.createdAt,
    //           sampleId: row.sampleId,
    //           sampleName: row.sampleName,
    //           locationId: row.locationId,
    //           locationName: row.locationName,
    //           paid: row.paid,
    //           partiesId: row.partiesId,
    //           companyName: row.companyName,
    //           account: row.account,
    //           properties: [],
    //         };
    //         acc.push(bill);
    //       }

    //       bill.properties.push({
    //         propertyName: row.propertyName,
    //         PropertyDescription: row.PropertyDescription,
    //         pprice: row.pprice,
    //         punit: row.punit,
    //         propertyMappingId: row.propertyMappingId,
    //         propertiesId: row.propertiesId,
    //         sampleResult: row.sampleResult,
    //       });

    //       let updatedBillProperty = bill.properties.map((ele) => {
    //         let findReult = resultQuery.find(
    //           (result) =>
    //             result.billId === bill.transactionId &&
    //             result.propertyId === ele.propertiesId
    //         );

    //         if (findReult) {
    //           return {
    //             ...ele,
    //             result: findReult.result,
    //             resultId: findReult._id,
    //           };
    //         } else {
    //           return ele;
    //         }
    //       });

    //       bill.properties = updatedBillProperty;

    //       return acc;
    //     }, []);

    mainWindow.webContents.send(
      "transactionList:success",
      JSON.stringify(groupedData)
    );
  } catch (e) {
    console.log(e);
  }
};

const getMonthBillCount = async (con, mainWindow, data) => {
  try {
    let currentDate = moment(data).format("YYYY-MM-DD");

    let qry = `SELECT COUNT(*) AS total_records
FROM sampleTransaction
WHERE MONTH(createdAt) = MONTH(#${currentDate}#) 
AND YEAR(createdAt) = YEAR(#${currentDate}#)`;

    let testQry = await con.query(qry);

    mainWindow.webContents.send(
      "billCount:success",
      JSON.stringify(testQry[0])
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  addTransaction,
  listTransaction,
  getMonthBillCount,
  updateTransaction,
  deleteDefaultProperty,
};
