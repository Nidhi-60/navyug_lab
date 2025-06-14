const odbc = require("odbc");
let con;

// const connection = odbc.connect("DSN=lab;");

const connection = async () => {
  try {
    if (!con) {
      con = await odbc.connect("DSN=laboratory_config;");
      console.log("Connected to Access database!");
    }

    return con;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

module.exports = { connection };
