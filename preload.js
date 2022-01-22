const { data } = require('autoprefixer');
const { ipcRenderer, contextBridge } = require('electron')
window.addEventListener('DOMContentLoaded', () => {
    // ReactDOM.render('<div>hello</div>', document.getElementById('root'))
    // const replaceText = (selector, text) => {
    //     const element = document.getElementById(selector)
    //     if (element) element.innerText = text
    // }

    // for (const dependency of ['chrome', 'node', 'electron']) {
    //     replaceText(`${dependency}-version`, process.versions[dependency])
    // }

})

var [handleLiveStream, handleMessage, handleMessageAck, handleCandidate, handleCandidateAck, handleOffer, handleOfferAck, handleAnswer, handleAnswerAck, handleEnd, handleEndAck] =
    [data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }]
contextBridge.exposeInMainWorld("electron", { ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on } });

contextBridge.exposeInMainWorld("setOnLiveStream", handler => handleLiveStream = handler)
contextBridge.exposeInMainWorld("setOnMessage", handler => handleMessage = handler)
contextBridge.exposeInMainWorld("setOnCandidate", handler => handleCandidate = handler)
contextBridge.exposeInMainWorld("setOnOffer", handler => handleOffer = handler)
contextBridge.exposeInMainWorld("setOnAnswer", handler => handleAnswer = handler)
contextBridge.exposeInMainWorld("setOnEnd", handler => handleEnd = handler)
contextBridge.exposeInMainWorld("setOnOfferAck", handler => handleOffer = handler)
contextBridge.exposeInMainWorld("setOnAnswerAck", handler => handleAnswer = handler)
contextBridge.exposeInMainWorld("setOnEndAck", handler => handleEnd = handler)

ipcRenderer.on('stream', (e, data) => {
    console.log('receive stream')
    console.log(data)
    switch (data.type) {
        case 'live':
            handleLiveStream(data)
            break
        case 'message':
            handleMessage(data)
            break
        case 'candidate':
            handleCandidate(data)
            break
        case 'offer':
            handleOffer(data)
            break
        case 'answer':
            handleAnswer(data)
            break
        case 'end':
            handleEnd(data)
            break
        case 'message-ack':
            handleMessageAck(data)
            break
        case 'candidate-ack':
            handleCandidateAck(data)
            break
        case 'offer-ack':
            handleOfferAck(data)
            break
        case 'answer-ack':
            handleAnswerAck(data)
            break
        case 'end-ack':
            handleEndAck(data)
            break
        default:
            break
    }
})



window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB ||
    window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
    window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange ||
    window.webkitIDBKeyRange || window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}


var db;
var request = window.indexedDB.open('dialog')
request.onerror = function (event) {
    console.log("Why didn't you allow my web app to use IndexedDB?!", event.target.error);
}
request.onsuccess = function (event) {
    db = event.target.result;
    console.log('db information:', db.name, db.version)
};
request.onupgradeneeded = function (event) {
    let db = event.target.result;
    let objectStore = db.createObjectStore("dialog", { keyPath: "id" });

    db.onerror = function (event) {
        console.error("Database error: " + event.target.errorCode);
    }
}


function openTx(storeName, mode) {
    let tx = db.transaction(storeName, mode)
    tx.oncomplete = function (event) {
        console.log(storeName + ' transaction done!')
    }
    tx.onerror = function (event) {
        console.log('create dialog error: ' + event.target.error)
    }
    return tx
}

function createDialog(data) {
    let tx = openTx(['dialog'], 'readwrite')
    let os = tx.objectStore('dialog')
    var request = os.add(data)
    request.onerror = function (event) {
        console.log('add dialog err: ' + event.target.error)
    }
}
function readDialog(key) {
    let tx = openTx(['dialog'], 'readonly')
    let os = tx.objectStore('dialog')
    os.get(key)
}
function readAllDialog(handleSuccess) {
    let tx = openTx(['dialog'], 'readonly')
    let os = tx.objectStore('dialog')
    let request = os.getAll()
    request.onerror = function (event) {
        console.log('read all dialog error: ', event.target.error)
    }
    request.onsuccess = function (event) {
        console.log('read all dialog result: ', request.result)
        handleSuccess(request.result)
        return
    }
}
function updateDialog(data) {
    let tx = openTx(['dialog'], 'readwrite')
    let os = tx.objectStore('dialog')
    let request = os.put(data)
}
function deleteDialog(key) {
    let tx = openTx(['dialog'], 'readwrite')
    let os = tx.objectStore('dialog')
    os.delete(key)
}
function createDialogItem(data) {
    let tx = openTx(['dialog_item'], 'readwrite')
    let os = tx.objectStore('dialog_item')
    var request = os.add(data)
    request.onerror = function (event) {
        console.log('add dialog item err: ' + event.target.error)
    }
}
function readAllDialogItem(handleSuccess) {
    let tx = openTx(['dialog'], 'readonly')
    let os = tx.objectStore('dialog')
    let request = os.getAll()
    request.onerror = function (event) {
        console.log('read all dialog item error: ', event.target.error)
    }
    request.onsuccess = function (event) {
        console.log('read all dialog item result: ', request.result)
        handleSuccess(request.result)
        return
    }
}
contextBridge.exposeInMainWorld('DB', {
    createDialog: createDialog,
    readDialog: readDialog,
    readAllDialog: readAllDialog,
    updateDialog: updateDialog,
    deleteDialog: deleteDialog,
    createDialogItem: createDialogItem,
    readAllDialogItem: readAllDialogItem
})
