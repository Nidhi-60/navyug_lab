const moment = require("moment");

const billShow = async (con, mainWindow, data) => {
  try {
    const { partyName, billNo, accountType, toDate, fromDate } = data;
    let updatedObj = {
      "t.partyId": partyName,
      "p.account": `'${accountType}'`,
    };

    let setClauses = [];
    for (const [key, value] of Object.entries(updatedObj)) {
      if (value !== null && value !== "") {
        setClauses.push(`${key}=${value}`);
      }
    }

    let toDateUpdated = moment(toDate).format("MM/DD/YYYY");
    let fromDateUpdated = moment(fromDate).format("MM/DD/YYYY");
    let setClause = setClauses.join(" AND ");

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
    tp.[remark],
    tp.[sampleId],
    tp.[_id] AS transactionPropertyId,
    pm.[_id] AS propertyMappingId,
    pm.[pprice],
    pm.[punit],
    sp.[propertyName]
  FROM 
      (((((([sampleTransaction] t
         INNER JOIN [partyDetail] p ON t.[partyId] = p.[_id])
          INNER JOIN [sample] s ON t.[sampleId] = s.[_id])
          INNER JOIN [location] l ON t.[locationId] = l.[_id])
          INNER JOIN [transactionProperties] tp ON t.[billNo] = tp.[billNo] AND t.[createdAt] = tp.[createdAt])
          INNER JOIN [propertyMapping] pm ON tp.[pid] = pm.[pid] AND tp.[sampleId] = pm.[sid])
          INNER JOIN [sampleProperty] sp ON sp.[_id] = pm.[pid])
WHERE 
    t.[createdAt] BETWEEN #${fromDateUpdated}# AND #${toDateUpdated}# AND ${setClause}
`;

    console.log("qry", qry);

    let testQry = await con.query(qry);

    const groupedObject = {};

    testQry.forEach((item) => {
      if (!groupedObject[item.billNo]) {
        // Create a new entry excluding property-specific fields
        groupedObject[item.billNo] = {
          billNo: item.billNo,
          transactionId: item.transactionId,
          createdAt: item.createdAt,
          paid: item.paid,
          partiesId: item.partiesId,
          companyName: item.companyName,
          account: item.account,
          sampleName: item.sampleName,
          locationName: item.locationName,
          sampleId: item.sampleId,
          properties: [],
        };
      }

      // Push the property-related fields to the properties array
      groupedObject[item.billNo].properties.push({
        transactionPropery: item.transactionPropery,
        transactionPropertyId: item.transactionPropertyId,
        propertyMappingId: item.propertyMappingId,
        pprice: item.pprice,
        punit: item.punit,
        propertyName: item.propertyName,
        remark: item.remark,
      });
    });

    // Convert the object values into an array
    const groupedData = Object.values(groupedObject);

    const mergedData = [];

    for (let item of groupedData) {
      let existing = mergedData.find(
        (group) =>
          group.sampleId === item.sampleId &&
          group.properties.length === item.properties.length &&
          group.properties.every(
            (prop, index) =>
              prop.propertyMappingId ===
              item.properties[index].propertyMappingId
          )
      );

      if (existing) {
        existing.billNo.push(item.billNo);
        existing.quntity += 1;
      } else {
        mergedData.push({
          companyName: item.companyName,
          sampleName: item.sampleName,
          billNo: [item.billNo],
          sampleId: item.sampleId,
          properties: item.properties,
          quntity: 1,
        });
      }
    }

    // const groupedResults = testQry.reduce((acc, row) => {
    //   let bill = acc.find((item) => item.billNo === row.billNo);
    //   if (!bill) {
    //     bill = {
    //       transactionId: row.transactionId,
    //       billNo: row.billNo,
    //       createdAt: row.createdAt,
    //       sampleId: row.sampleId,
    //       sampleName: row.sampleName,
    //       locationId: row.locationId,
    //       locationName: row.locationName,
    //       paid: row.paid,
    //       partiesId: row.partiesId,
    //       companyName: row.companyName,
    //       properties: [],
    //     };
    //     acc.push(bill);
    //   }

    //   bill.properties.push({
    //     propertyName: row.propertyName,
    //     PropertyDescription: row.PropertyDescription,
    //     pprice: row.pprice,
    //     punit: row.punit,
    //     propertyMappingId: row.propertyMappingId,
    //     propertiesId: row.propertiesId,
    //     sampleResult: row.sampleResult,
    //   });

    //   return acc;
    // }, []);

    console.log("JSON.stringify(mergedData)", JSON.stringify(mergedData));

    mainWindow.webContents.send("report:success", JSON.stringify(mergedData));
  } catch (e) {
    console.log(e);
  }
};

const customReport = async (con, mainWindow, data) => {
  try {
    const { fromDate, toDate, partyName, account, sampleName, testName } = data;

    let updatedObj = {
      "t.partyId": partyName,
      "p.account": account ? `'${account}'` : undefined,
      "t.sampleId": sampleName,
      "tp.pid": testName,
    };

    let setClauses = [];
    for (const [key, value] of Object.entries(updatedObj)) {
      if (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        value !== "undefined"
      ) {
        setClauses.push(`${key}=${value}`);
      }
    }

    let toDateUpdated = moment(toDate).format("MM/DD/YYYY");
    let fromDateUpdated = moment(fromDate).format("MM/DD/YYYY");
    let setClause = setClauses.join(" AND ");

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
    tp.[remark],
    tp.[sampleId],
    tp.[_id] AS transactionPropertyId,
    pm.[_id] AS propertyMappingId,
    pm.[pprice],
    pm.[punit],
    sp.[propertyName]
  FROM 
      (((((([sampleTransaction] t
         INNER JOIN [partyDetail] p ON t.[partyId] = p.[_id])
          INNER JOIN [sample] s ON t.[sampleId] = s.[_id])
          INNER JOIN [location] l ON t.[locationId] = l.[_id])
          INNER JOIN [transactionProperties] tp ON t.[billNo] = tp.[billNo] AND t.[createdAt] = tp.[createdAt])
          INNER JOIN [propertyMapping] pm ON tp.[pid] = pm.[pid] AND tp.[sampleId] = pm.[sid])
          INNER JOIN [sampleProperty] sp ON sp.[_id] = pm.[pid])
  WHERE 
    t.[createdAt] BETWEEN #${fromDateUpdated}# AND #${toDateUpdated}# AND ${setClause}
  `;

    let testQry = await con.query(qry);

    const groupedResults = testQry.reduce((acc, row) => {
      let bill = acc.find((item) => item.billNo === row.billNo);
      if (!bill) {
        bill = {
          transactionId: row.transactionId,
          billNo: row.billNo,
          createdAt: row.createdAt,
          sampleId: row.sampleId,
          sampleName: row.sampleName,
          locationId: row.locationId,
          locationName: row.locationName,
          paid: row.paid,
          partiesId: row.partiesId,
          companyName: row.companyName,
          account: row.account,
          properties: [],
        };
        acc.push(bill);
      }

      bill.properties.push({
        propertyName: row.propertyName,
        PropertyDescription: row.PropertyDescription,
        pprice: row.pprice,
        punit: row.punit,
        propertyMappingId: row.propertyMappingId,
        propertiesId: row.propertiesId,
        sampleResult: row.sampleResult,
      });

      return acc;
    }, []);

    mainWindow.webContents.send(
      "loadReport:success",
      JSON.stringify(groupedResults)
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = { billShow, customReport };
