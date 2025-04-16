const path = require("path");
const url = require("url");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  screen,
  webContents,
} = require("electron");
const { connection } = require("./config/dbConnection");
const {
  list,
  create,
  update,
  deleteRecord,
  searchParty,
  getPartyAddress,
} = require("./server/partyDetail");
const { signin, setUser } = require("./server/auth");
const {
  unitList,
  sampleSearch,
  addSample,
  addSampleProperty,
  getSampleProperty,
  sampleSearchProperty,
  addMapping,
  sampleList,
  updateSample,
  deleteSample,
  propertyList,
  updateProperty,
  deleteProperty,
  deletePredefinedMapping,
} = require("./server/sampleMaster");
const { search } = require("./server/location");
const {
  addTransaction,
  listTransaction,
  getMonthBillCount,
} = require("./server/transaction");
const { billShow, customReport } = require("./server/reports");
const { addResult, updateResult } = require("./server/sampleResults");

// connect db
let con;
(async () => {
  try {
    con = await connection();
  } catch (error) {
    console.error("Error executing query:", error);
  }
})();

let mainWindow;
let userType;

let isDev = false;
const isMac = process.platform === "darwin" ? true : false;

if (
  process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV === "development"
) {
  isDev = true;
}

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    title: "Electron App",
    icon: `${__dirname}/src/assets/logo.png`,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // mainWindow.maximize();

  let indexPath;

  if (isDev && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: "localhost:8080",
      pathname: "index.html",
      slashes: true,
    });
  } else {
    indexPath = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "dist", "index.html"),
      // pathname: path.join(
      //   "D:/Laboratory/release-builds/react-electron-win32-x64/resources/app/dist/index.html"
      // ),
      // pathname: path.join(),
      // pathname: `${process.cwd()}/dist/index.html`,
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open devtools if dev
    if (isDev) {
      // const {
      // 	default: installExtension,
      // 	REACT_DEVELOPER_TOOLS,
      // } = require('electron-devtools-installer')

      // installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
      // 	console.log('Error loading React DevTools: ', err)
      // )
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

const defaultMenu = [];

const userMenu = [
  {
    label: "Master",
    submenu: [
      {
        label: "Party Master",
        accelerator: "ctrl+p",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "partyMaster" });
        },
      },
      {
        label: "Sample Master",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "sampleMaster" });
        },
      },
      {
        label: "Sample Transaction",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "sampleTransaction" });
        },
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

const template = [
  // {
  //   label: "Auth",
  //   submenu: [
  //     {
  //       label: "Sign In",
  //       click: () => {
  //         mainWindow.webContents.send("menu", { LABEL: "signIn" });
  //       },
  //     },
  //     {
  //       label: "Sign Up",
  //       click: () => {
  //         mainWindow.webContents.send("menu", { LABEL: "signUp" });
  //       },
  //     },
  //     {
  //       label: "Logout",
  //       click: () => {
  //         mainWindow.webContents.send("menu", { LABEL: "logut" });
  //       },
  //     },
  //   ],
  // },
  {
    label: "Master",
    submenu: [
      {
        label: "Party Master",
        accelerator: "ctrl+p",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "partyMaster" });
        },
      },
      {
        label: "Samples",
        accelerator: "ctrl+s",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "samples" });
        },
      },
      {
        label: "Properties",
        accelerator: "ctrl+p",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "properties" });
        },
      },
      {
        label: "Sample Master",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "sampleMaster" });
        },
      },
      {
        label: "Sample Transaction",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "sampleTransaction" });
        },
      },
    ],
  },
  {
    label: "Reports",
    submenu: [
      {
        label: "Custom Report",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "customReport" });
        },
      },
      {
        label: "Account Report",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "accountReport" });
        },
      },
      {
        label: "Bill Show",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "billShow" });
        },
      },
      {
        label: "Address Print",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "addressPrint" });
        },
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.on("ready", () => {
  createMainWindow();

  const menu = Menu.buildFromTemplate(defaultMenu);
  Menu.setApplicationMenu(menu);
});

// api section

// auth
ipcMain.on("signin:load", async (e, data) =>
  signin(con, data, mainWindow, template, userMenu, app)
);

ipcMain.on("setUser:load", (e, data) => {
  setUser(con, data, mainWindow, template, userMenu, app);
});

// partydetail
ipcMain.on("partyDetail:load", async (e, search, searchText) =>
  list(con, searchText, search, mainWindow)
);

ipcMain.on("addPartyDetail:load", async (e, data) =>
  create(con, data, mainWindow)
);

ipcMain.on("updatePartyDetail:load", async (e, data) =>
  update(con, data, mainWindow)
);

ipcMain.on("deleteParyDetail:load", async (e, data) =>
  deleteRecord(con, data, mainWindow)
);

ipcMain.on("searchParty:load", async () => searchParty(con, mainWindow));

// sample master
ipcMain.on("sampleSearch:load", async () => sampleSearch(con, mainWindow));

ipcMain.on("sampleList:load", async () => sampleList(con, mainWindow));

ipcMain.on("addSample:load", (e, data) => addSample(con, mainWindow, data));

ipcMain.on("updateSample:load", (e, data) =>
  updateSample(con, mainWindow, data)
);

ipcMain.on("deleteSample:load", (e, data) =>
  deleteSample(con, mainWindow, data)
);

ipcMain.on("propertyList:load", async () => propertyList(con, mainWindow));

ipcMain.on("updateProperty:load", (e, data) =>
  updateProperty(con, mainWindow, data)
);

ipcMain.on("deleteProperty:load", (e, data) =>
  deleteProperty(con, mainWindow, data)
);

ipcMain.on("addProperty:load", (e, data) =>
  addSampleProperty(con, mainWindow, data)
);

ipcMain.on("getSampleProperty:load", (e, data) =>
  getSampleProperty(con, mainWindow, data)
);

ipcMain.on("sampleSearchProperty:load", async () =>
  sampleSearchProperty(con, mainWindow)
);

ipcMain.on("addMapping:load", async (e, data) =>
  addMapping(con, mainWindow, data)
);

ipcMain.on("deletePredefinedMapping:load", async (e, data) =>
  deletePredefinedMapping(con, mainWindow, data)
);

ipcMain.on("unit:load", async () => unitList(con, mainWindow));

// location
ipcMain.on("location:load", async () => search(con, mainWindow));

// transaction
ipcMain.on("addBill:load", async (e, data) =>
  addTransaction(con, mainWindow, data)
);

ipcMain.on("transactionList:load", (e, data) =>
  listTransaction(con, mainWindow, data)
);

ipcMain.on("report:load", (e, data) => billShow(con, mainWindow, data));

ipcMain.on("saveTestResult:load", (e, data) =>
  addResult(con, mainWindow, data)
);

ipcMain.on("updateResult:load", (e, data) =>
  updateResult(con, mainWindow, data)
);

ipcMain.on("billCount:load", (e, data) => getMonthBillCount(con, mainWindow, data));

ipcMain.on("loadReport:load", (e, data) => customReport(con, mainWindow, data));

ipcMain.on("companySearch:load", (e, data) =>
  getPartyAddress(con, mainWindow, data)
);
