// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const fs = require('fs')
const path = require('path')
const notifier = require('node-notifier');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      nodeIntegration: false,
      preload: __dirname + '/preload.js'
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL('https://react-web-chat.herokuapp.com/')
  mainWindow.loadURL('http://localhost:3000')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const appId = 'Electron-web-loader'
app.setAppUserModelId(appId)
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('notification', (event, arg) => {
  if (mainWindow.isMinimized() || !mainWindow.isVisible() || !mainWindow.isFocused()) {    
    var osvar = process.platform;

    if (osvar == 'darwin') {
      console.log("you are on a mac os");
    } else if (osvar == 'win32') {
      console.log("you are on a windows os")      
      // FOR WINDOWS
      notifier.notify(
        {
        title: "You've got a message from " + arg.name,
        message: arg.text,
        icon: path.join(__dirname, './build/appIcn.png.ico'),
        sound: true,
        contentImage: path.join(__dirname, './data.jpeg'),
        timeout: 5
      }
    );
    } else {
      console.log("unknown os")
    }
    let myNotification = new Notification({
      title: "You've got a message from " + arg.name,
      body: arg.text,
      hasReply: true,
      silent: false,
      closeButtonText: 'close'
    });

    myNotification.show();

    myNotification.on('reply', (event, hasReply) => {

      let data = {
        message: hasReply,
      };

      mainWindow.webContents.send('direct-reply', data);
    });

  }
})