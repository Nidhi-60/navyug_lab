const { Menu } = require("electron");

const signin = async (con, data, mainWindow, template, userMenu, app) => {
  try {
    let { userName, password } = data;

    let qry = `SELECT TOP 1 * FROM auth WHERE [userName]='${userName}' AND [password]='${password}';`;

    const result = await con.query(qry);

    let resultItem = JSON.parse(JSON.stringify(result));

    if (resultItem.length > 0) {
      let logoutMenu = [
        {
          label: "Logout",
          click: () => {
            mainWindow.webContents.send("logout");
            app.quit();
          },
        },
      ];

      if (resultItem[0].role === "admin") {
        const menu = Menu.buildFromTemplate([...template, ...logoutMenu]);
        Menu.setApplicationMenu(menu);
      } else {
        const menu = Menu.buildFromTemplate([...userMenu, ...logoutMenu]);
        Menu.setApplicationMenu(menu);
      }

      mainWindow.webContents.send(
        "signin:success",
        JSON.stringify({ success: true, result })
      );
    } else {
      mainWindow.webContents.send(
        "signin:success",
        JSON.stringify({ success: false })
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const setUser = (con, data, mainWindow, template, userMenu, app) => {
  let logoutMenu = [
    {
      label: "Logout",
      click: () => {
        mainWindow.webContents.send("logout");
        app.quit();
      },
    },
  ];

  if (data.role === "admin") {
    const menu = Menu.buildFromTemplate([...template, ...logoutMenu]);
    Menu.setApplicationMenu(menu);
  } else {
    const menu = Menu.buildFromTemplate([...userMenu, ...logoutMenu]);
    Menu.setApplicationMenu(menu);
  }
};

module.exports = { signin, setUser };
