const search = async (con, mainWindow) => {
  try {
    let qry = `select [location],[_id],[isDefault] from location`;

    let result = await con.query(qry);

    mainWindow.webContents.send("location:success", JSON.stringify(result));
  } catch (e) {
    console.log(e);
  }
};

module.exports = { search };
