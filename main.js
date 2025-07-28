const path = require("path");
const fs = require("fs");
const url = require("url");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  screen,
  shell,
} = require("electron");
const { connection } = require("./config/dbConnection");
const {
  list,
  create,
  update,
  deleteRecord,
  searchParty,
  getPartyAddress,
  accountSearchParty,
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
  addUnit,
  updateUnit,
  deleteUnit,
} = require("./server/sampleMaster");
const { search } = require("./server/location");
const {
  addTransaction,
  listTransaction,
  getMonthBillCount,
  updateTransaction,
  deleteDefaultProperty,
  updateTransactionOnSample,
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

  mainWindow.maximize();

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

  mainWindow.on("close", (e) => {
    mainWindow.webContents.send("logout");
  });

  // mainWindow.on("closed", () => (mainWindow = null));
}

app.commandLine.appendSwitch("enable-features", "WebShare,WebShareFile");

app.commandLine.appendSwitch(
  "enable-features",
  "WebShare,WebShareFileAPI" // lets navigator.share accept { files }
);

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
        label: "Unit",
        accelerator: "ctrl+u",
        click: () => {
          mainWindow.webContents.send("menu", { LABEL: "unit" });
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
      // {
      //   label: "Account Report",
      //   click: () => {
      //     mainWindow.webContents.send("menu", { LABEL: "accountReport" });
      //   },
      // },
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

ipcMain.on("accountSearchParty:load", async (e, data) =>
  accountSearchParty(con, mainWindow, data)
);

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

// location
ipcMain.on("location:load", async () => search(con, mainWindow));

// transaction
ipcMain.on("addBill:load", async (e, data) =>
  addTransaction(con, mainWindow, data)
);

ipcMain.on("updateBill:load", async (e, data) =>
  updateTransaction(con, mainWindow, data)
);

ipcMain.on("updateBillSampleChange:load", async (e, data) =>
  updateTransactionOnSample(con, mainWindow, data)
);

ipcMain.on("deleteDefautProperty:load", async (e, data) =>
  deleteDefaultProperty(con, mainWindow, data)
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

ipcMain.on("billCount:load", (e, data) =>
  getMonthBillCount(con, mainWindow, data)
);

ipcMain.on("loadReport:load", (e, data) => customReport(con, mainWindow, data));

ipcMain.on("companySearch:load", (e, data) =>
  getPartyAddress(con, mainWindow, data)
);

ipcMain.on("unit:load", async () => unitList(con, mainWindow));

ipcMain.on("addUnit:load", async (e, data) => addUnit(con, mainWindow, data));

ipcMain.on("updateUnit:load", async (e, data) =>
  updateUnit(con, mainWindow, data)
);

ipcMain.on("deleteUnit:load", async (e, data) =>
  deleteUnit(con, mainWindow, data)
);

ipcMain.on("print", (e, htmlContent, isReport) => {
  const printWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: true, // must be true to preview
    webPreferences: {
      contextIsolation: true,
    },
    frame: false,
    transparent: false,
  });

  const fullHtml = `
    <html>
      <head>
        <title>Print Preview</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
          }
          h1 {
            margin-bottom: 10px;
          }
          
          .d-flex {
              display: flex;
          }

          .justify-content-around{
             justify-content: space-around;
          }

          table{
            width:"100%"
          }
          
         
          button{
            padding: 1px 5px 1px 5px;
          }

          .btn-secondary {
            background-color: #534e4e;
            color: #fff
          }

            .btn-primary {
              background-color: #9e444b;
              color: #fff;
            }

          .printContent {
              display: block;
          }

          @media print {
            .printContent {
                display: none;
          }
          }
        </style>
      </head>
      <body>
      <div class="d-flex">
      <button id="print" class='printContent btn btn-primary'>Print</button>
      <button id='close' class="printContent btn btn-secondary">Close</button>
  
      </div>

        ${htmlContent}
     
      </body>

      <script>
         let btn = document.getElementById("print")
         let closeBtn = document.getElementById("close")
         btn.addEventListener("click", function() {
          window.print();
         })

         closeBtn.addEventListener("click", () =>{
            window.close()
          }) 

        window.addEventListener('afterprint', () => {
            window.close();
          });
      </script>
    </html>
  `;

  printWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(fullHtml)
  );
});

ipcMain.on("share-certificate", async (event, uint8Array) => {
  try {
    const buffer = Buffer.from(uint8Array);

    const tempPath = path.join(app.getPath("temp"), "certificate-shared.pdf");

    fs.writeFileSync(tempPath, buffer);

    // Open with system default app (email, PDF viewer, etc.)
    await shell.openPath(tempPath);
  } catch (err) {
    console.error("Failed to share/open PDF:", err);
  }
});

ipcMain.on("pdfPrint", (e, htmlContent) => {
  const printWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: true, // must be true to preview
    webPreferences: {
      contextIsolation: false,
      experimentalFeatures: true,
      nodeIntegration: true,
    },
    frame: false,
    transparent: false,
  });

  const fullHtml = `
    <html>
      <head>
        <title>Print Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
              /* ------------------------------------------------------------------ */
          /*  A4 PRINT SETTINGS                                                 */
          /* ------------------------------------------------------------------ */
          @media print {
            @page { size: A4; margin: 20mm; }
            html, body {
            width: 210mm;
            height: 297mm;
          }
          }


          /* ------------------------------------------------------------------ */
          /*  PAGE WRAPPER                                                      */
          /* ------------------------------------------------------------------ */
          .cert-page {
              width: 210mm;
              min-height: 297mm;
              padding: 10mm;
              box-sizing: border-box;
              overflow: hidden;
              font-family: Arial, sans-serif;
          }

            .cert-page * {
              max-width: 100%;
              box-sizing: border-box;
              overflow-wrap: break-word;
            }

          /* ------------------------------------------------------------------ */
          /*  LETTER‑HEAD (LAB INFO + LOGO)                                     */
          /* ------------------------------------------------------------------ */
          .cert-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            background: #d7dade;               /* light‑grey strip across header */
            border-bottom: 2px solid #999;
            padding: 6mm;
            font-size: 12px;
          }

          .lab-info > div { margin-bottom: 2px; }

          .logo-block { display: flex; align-items: center; }

          /* optional placeholder circle; remove if you place a real PNG/SVG */
          .logo-circle {
            width: 26mm;
            height: 26mm;
            border: 3mm solid #d40000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18mm;
            font-weight: bold;
            color: #d40000;
            margin-right: 4mm;
          }

          .logo-text {
            text-align: right;
            line-height: 1.1;
          }

          .logo-text h2 {
                  margin: 0;
                font-size: 45px;
                letter-spacing: 1px;
                color: #3c3c3c;
                font-weight: 500;
          }

          .logo-text div:nth-child(2) {       /* “ANALYTICAL LABORATORY” */
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.4px;
          }

          .logo-text div:nth-child(3) {       /* “Since 1983” */
            font-size: 14px;
            font-style: normal;
            margin-top: 1mm;
            font-weight: 500;
          }

          /* ------------------------------------------------------------------ */
          /*  NARROW STRIP (TIMING + SCOPE)                                     */
          /* ------------------------------------------------------------------ */
          .strip {
            font-size: 11px;
            background: transparent;           /* no fill colour */
            padding: 2mm 3mm;
            margin: 4mm 0 8mm;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #999;     /* thin underline for separation */
          }

          /* ------------------------------------------------------------------ */
          /*  MAIN TITLE                                                        */
          /* ------------------------------------------------------------------ */
          .cert-title {
            text-align: center;
            margin: 0;
            color: #b50000;                    /* deep red */
            letter-spacing: 0.5px;
            font-size: 22px;
            font-weight: 700;
          }
          .sub { text-align: center; font-size: 11px; margin: 1mm 0 8mm; }

          /* ------------------------------------------------------------------ */
          /*  META INFO (REF NO + DATE)                                         */
          /* ------------------------------------------------------------------ */
          .meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }

          /* ------------------------------------------------------------------ */
          /*  SECTION 1 : SAMPLE DETAILS                                        */
          /* ------------------------------------------------------------------ */
          .sec-heading { margin: 8mm 0 2mm; font-size: 14px; }

          .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          .details-table th,
          .details-table td {
            border: 1px solid #999;
            padding: 3mm 2mm;
            text-align:center
          }

          /* both header rows share the same grey */
          .details-table th {
            background: #d7dade;
            text-align: center;
          }

          /* ------------------------------------------------------------------ */
          /*  SECTION 2 : RESULTS                                               */
          /* ------------------------------------------------------------------ */
          .results-head {
            margin: 8mm 0 2mm;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }

          .results-block {
            background: #d7dade;               /* pale grey block behind table */
            padding: 6mm 4mm;
            min-height: 40mm;                  /* keeps area tall even if few rows */
          }

          .results-table {
            width: 100%;
            border-collapse: collapse;
          }

          .results-table td {
            padding: 1.5mm 3mm;
            font-size: 13px;
          
          }

          /* ------------------------------------------------------------------ */
          /*  SIGNATURE + FOOTER                                                */
          /* ------------------------------------------------------------------ */
          .sig-area { margin-top: 5mm; font-size: 12px; }

          .sig-area .blank-line {
            width: 60mm;
            height: 0;
            border-bottom: 1px solid #000;
            margin: 4mm 0;
          }

          .auth-sign { margin-top: 5mm; }

          .note { font-size: 11px; margin-top:5mm; }

          /* ------------------------------------------------------------------ */
          /*  WATERMARK                                                         */
          /* ------------------------------------------------------------------ */
          .watermark {
              position: absolute;
              bottom: 45mm;
              right: 14mm;
              font-size: 121px;
              font-weight: 700;
              color: #000;
              opacity: 0.03;
              pointer-events: none;
              user-select: none;
              transform: rotate(-25deg);
          }

          .logo-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-25deg);
              opacity: 0.05;
              width: 70%;
              max-width: 500px;
              z-index: 0;
              pointer-events: none;
              user-select: none;
            }


        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

      </head>
      <body>
            <div class="d-flex">
            <button id="share" class="btn btn-primary">Share</button>
            <button id='close' class="printContent btn btn-secondary">Close</button>
            </div>
          <div>
          ${htmlContent}
          </div>
      </body>
      <script>
          const { ipcRenderer } = require("electron");
          const generatePDFBlob = async () => {
                const certContent = document.getElementById("cert-page");
                return new Promise((resolve, reject) => {
                  const opt = {
                    margin: 0,
                    filename: 'certificate.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait',format: [210, 297], }
                  };

                  html2pdf()
                    .from(certContent)
                    .set(opt)
                    .outputPdf('blob')
                    .then(resolve)
                    .catch(reject);
                }); 
          };


          let closeBtn = document.getElementById("close");
          const shareButton = document.getElementById("share");
          let certDoc = document.getElementById("cert-page")

          console.log(certDoc)
          

          closeBtn.addEventListener("click",  () =>{
              window.close()
            })

              //  const blob = new Blob([certDoc], { type: "application/pdf" }); // for download
              // const file = new File([blob], "certificate.pdf", { type: "application/pdf" });

           


            shareButton.addEventListener("click", async () => {
                    const certContent = document.querySelector(".cert-page");
                    const blob = await generatePDFBlob();
                     const file = new File([blob], "certificate.pdf", { type: "application/pdf" });

                if (!certContent) {
                  alert("No certificate content found.");
                  return;
                }

                 const isElectron = navigator.userAgent.toLowerCase().includes("electron");


                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                      await navigator.share({
                        title: "Certificate",
                        text: "Sharing the certificate file",
                        files: [file],
                      });
                    } catch (err) {
                      console.error("Sharing failed:", err);
                      alert("Sharing failed.");
                    }
                  }
                  // else if (isElectron) {
                  //   const arrayBuffer = await blob.arrayBuffer();
                  //   const uint8Array = Array.from(new Uint8Array(arrayBuffer));
  
                  //   ipcRenderer.send("share-certificate", uint8Array);
                  // }  
                  else {
                     const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "certificate.pdf";
                      a.style.display = "none";
                      document.body.appendChild(a);
                      a.click();
                      URL.revokeObjectURL(url);
                      a.remove();
                  }
        });
      </script>
    </html>
  `;

  // printWindow.webContents.openDevTools();

  printWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(fullHtml)
  );
});
