const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')

let mainWindow = null
function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })
    window.webContents.openDevTools()
    window.loadFile('index.html')
    return window
}

app.whenReady().then(() => {
    mainWindow = createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

const AuthClient = require('./src/auth/auth')
ipcMain.on('loadCaptcha', (e, ...args) => {
    console.log('loadCaptcha request:', args[0])
    AuthClient.Captcha(args[0], (err, data) => {
        if (err) {
            console.log('loadCaptcha err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})

ipcMain.on('login', (e, ...args) => {
    console.log('login request:', args[0])
    AuthClient.Login(args[0], (err, data) => {
        if (err) {
            console.log('login err: ' + err)
            e.returnValue = { err: err }
            return
        }
        signal(e, data.sessionID)
        e.returnValue = data
    })
})

const RtcClient = require('./src/rtc/rtc')
ipcMain.on('signal', (e, ...args) => {
    console.log('signaling', args[0])
    if (SignalClient) {
        SignalClient.write(args[0])
    }
})
var SignalClient
async function signal(e, sessionID) {
    SignalClient = RtcClient.Signal()
    SignalClient.write({
        type: 'peer',
        localID: sessionID
    })
    SignalClient.on('err', err => {
        console.log("stream client err:" + err)
        SignalClient = null
    })
    SignalClient.on('data', data => {
        console.log('stream server data: ')
        console.log(data)
        mainWindow.webContents.send('stream', data);
    })
    SignalClient.on('end', () => {
        console.log("stream end")
        SignalClient = null
    })
}

ipcMain.on('logout', (e, ...args) => {
    console.log('logout request:', args[0])
    AuthClient.Logout(args[0], (err, data) => {
        if (err) {
            console.log('logout err: ' + err)
            e.returnValue = { err: err }
        }
        SignalClient = null
        e.returnValue = data
    })
})

ipcMain.on('register', (e, ...args) => {
    console.log('register request:', args[0])
    AuthClient.Register(args[0], (err, data) => {
        if (err) {
            console.log('register err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})

const DialogClient = require('./src/dialog/dialog')
ipcMain.on('createDialog', (e, ...args) => {
    console.log('create dialog request;', args[0])
    DialogClient.Create(args[0], (err, data) => {
        if (err) {
            console.log('create dialog err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})
ipcMain.on('listDialog', (e, ...args) => {
    console.log('list dialog request:', args[0])
    DialogClient.List(args[0], (err, data) => {
        if (err) {
            console.log('list dialog err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})

const UserClient = require('./src/user/user')
ipcMain.on('findFriend', (e, ...args) => {
    console.log('find friend request:', args[0])
    UserClient.List(args[0], (err, data) => {
        if (err) {
            console.log('find friend err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})
ipcMain.on('addrBook', (e, ...args) => {
    console.log('address book request', args[0])
    UserClient.AddrBook(args[0], (err, data) => {
        if (err) {
            console.log('addr book err: ' + err)
            e.returnValue = { err: err }
            console.log(err)
        }
        console.log(data)
        e.returnValue = data
    })
})

const FriendClient = require('./src/friend/friend')
const { PureComponent } = require('react')
const { data } = require('autoprefixer')
ipcMain.on('apply', (e, ...args) => {
    console.log('apply friend request:', args[0])
    FriendClient.Apply(args[0], (err, data) => {
        if (err) {
            console.log('apply friend err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})
ipcMain.on('applyList', (e, ...args) => {
    console.log('apply list request:', args[0])
    FriendClient.ApplyList(args[0], (err, data) => {
        if (err) {
            console.log('apply list err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})
ipcMain.on('unfriend', (e, ...args) => {
    console.log('unFriend request:', args[0])
    FriendClient.UnFriend(args[0], (err, data) => {
        if (err) {
            console.log('unfriend err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})
ipcMain.on('review', (e, ...args) => {
    console.log('review friend request:', args[0])
    FriendClient.Review(args[0], (err, data) => {
        if (err) {
            console.log('review friend err: ' + err)
            e.returnValue = { err: err }
        }
        e.returnValue = data
    })
})