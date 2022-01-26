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

var [handleLiveStream, handleMessage, handleMessageAck, handleBackgroundMessage, handleBackgroundMessageAck, handleReceipt, handleReceiptAck, handleBackgroundReceipt, handleBackgroundReceiptAck, handleCandidate, handleCandidateAck, handleOffer, handleOfferAck, handleAnswer, handleAnswerAck, handleEnd, handleEndAck] =
    [data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }, data => { }]
contextBridge.exposeInMainWorld("electron", { ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on } });

contextBridge.exposeInMainWorld("setOnLiveStream", handler => handleLiveStream = handler)
contextBridge.exposeInMainWorld("setOnMessage", handler => handleMessage = handler)
contextBridge.exposeInMainWorld("setOnMessageAck", handler => handleMessageAck = handler)
contextBridge.exposeInMainWorld("setOnBackgroundMessage", handler => handleBackgroundMessage = handler)
contextBridge.exposeInMainWorld("setOnBackgroundMessageAck", handler => handleBackgroundMessageAck = handler)
contextBridge.exposeInMainWorld("setOnReceipt", handler => handleReceipt = handler)
contextBridge.exposeInMainWorld("setOnReceiptAck", handler => handleReceiptAck = handler)
contextBridge.exposeInMainWorld("setOnBackgroundReceipt", handler => handleBackgroundReceipt = handler)
contextBridge.exposeInMainWorld("setOnBackgroundReceiptAck", handler => handleBackgroundReceiptAck = handler)
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
        case 'ack:message': // local message ack
            handleBackgroundMessageAck(data)
            handleMessageAck(data) //
            break
        case 'ack:receipt': // local message ack
            handleBackgroundReceiptAck(data)
            handleReceiptAck(data) //
            break
        case 'live':
            handleLiveStream(data)
            break
        case 'receipt':
            handleBackgroundReceipt(data)
            handleReceipt(data)
            break
        case 'message': // remote message
            handleBackgroundMessage(data) // save to indexedDB
            handleMessage(data) // display in specific dialog
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

let TX = window.IDBTransaction || window.webkitIDBTransaction ||
    window.msIDBTransaction;

let KR = window.IDBKeyRange ||
    window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let DB = null
let currentVersion = 8
let DBRequest = window.indexedDB.open('hello_word', currentVersion)
DBRequest.onerror = e => {
    console.log(e.target.error)
}
DBRequest.onsuccess = e => {
    DB = e.target.result
    console.log('db connect success: ', DB.name, DB.version)
}
DBRequest.onupgradeneeded = e => {
    DB = e.target.result
    console.log(DB.name, ' db need upgrade, current version: ', DB.version)

    if (e.oldVersion < currentVersion) {
        DB.deleteObjectStore('dialog')
        DB.deleteObjectStore('message')
    }
    let dialogStore = DB.createObjectStore('dialog', { keyPath: 'remoteID' })
    dialogStore.createIndex('localID', 'remoteID', { unique: false })
    let messageStore = DB.createObjectStore('message', { keyPath: 'msgID' })
    messageStore.createIndex('remoteID', 'msgID', { unique: false })
    messageStore.createIndex('remoteread', 'msgID', { unique: false })
    DB.onerror = e => {
        console.log(e.target.error)
    }
}

function OpenTX(storeNames, mode, oncomplete, onerror, onabort) {
    let tx = DB.transaction(storeNames, mode)
    tx.oncomplete = oncomplete
    tx.onerror = onerror
    tx.onabort = onabort
    return tx
}

function SetRemoteRead(msgID) {
    console.log('Set remoteread from indexDB, msgID: ', msgID)
    let tx = OpenTX(['message'], 'readwrite', e => {
        console.log('Set remoteread from indexedDB success')
    }, e => {
        console.log('Set remoteread open transaction failed', tx.error)
    }, e => {
        console.log('Set remoteread transaction abort ', tx.error)
    })
    let msgStore = tx.objectStore('message')
    let getRequest = msgStore.get(msgID)
    getRequest.onsuccess = e => {
        let message = getRequest.result
        console.log('get message result: ', message)
        if (message) {
            message.remoteread = message.remoteID + '::1'
            let updateRequest = msgStore.put(message)
            updateRequest.onsuccess = e => {
                console.log('update message remoteread success')
            }
            updateRequest.onerror = e => {
                console.log('update message remoteread error: ', updateRequest.error)
            }
        }
    }
    getRequest.onerror = e => {
        console.log('get message error: ', getRequest.error)
    }
}
contextBridge.exposeInMainWorld('SetRemoteRead', SetRemoteRead)
function ReadMessages(remoteID, onSuccess) {
    console.log('read messages from indexDB')
    let tx = OpenTX(['message'], 'readwrite', e => {
        console.log('read message in indexedDB success')
    }, e => {
        console.log('read message open transaction failed', tx.error)
    }, e => {
        console.log('read message transaction abort ', tx.error)
    })
    let index = tx.objectStore('message').index('remoteID')
    let request = index.getAll()
    request.onsuccess = e => {
        onSuccess(request.result)
    }
}
contextBridge.exposeInMainWorld('ReadMessages', ReadMessages)
function SaveMessages(messages) {
    console.log("Save Messages: ", messages)
    let tx = OpenTX(['dialog', 'message'], 'readwrite', e => {
        console.log('save message in indexedDB success')
    }, e => {
        console.log('save message open transaction failed', tx.error)
    }, e => {
        console.log('save message transaction abort ', tx.error)
    })
    let remoteIDs = messages.map(message => message.remoteID)
    let uniqueRemoteIDs = Array.from(new Set(remoteIDs))
    console.log('save message open transaction success, start to save to indexDB')
    let dialogOS = tx.objectStore('dialog')
    uniqueRemoteIDs.forEach(remoteID => {
        dialogOS.put({
            remoteID: remoteID
        })
    })
    let messageOS = tx.objectStore('message')
    messages.forEach(message => {
        messageOS.put(message)
    });
}
contextBridge.exposeInMainWorld('SaveMessages', SaveMessages)

function CreateDialogs(localID, remoteIDs) {
    if (remoteIDs) {
        let tx = OpenTX(['dialog', 'message'], 'readwrite', e => {
            console.log('create dialogs open transaction success')
        }, e => {
            console.log('create dialogs open transaction failed', tx.error)
        }, e => {
            console.log('create dialogs transaction abort ', tx.error)
        })
        let dialogStore = tx.objectStore('dialog')
        remoteIDs.forEach(remoteID => {
            dialogStore.put({
                localID: localID,
                remoteID: remoteID
            })
        })
    }
}
function ReadDialogs(onSuccess) {
    console.log('start read dialogs')
    let tx = OpenTX(['dialog', 'message'], 'readwrite', e => {
        console.log('read dialogs open transaction success')
    }, e => {
        console.log('read dialogs open transaction failed', tx.error)
    }, e => {
        console.log('read dialogs transaction abort ', tx.error)
    })
    console.log('get object store')
    let index = tx.objectStore('dialog').index('localID')
    let request = index.getAll()
    console.log('prepare onsuccess')
    request.onsuccess = function (e) {
        console.log('read dialogs result: ', request.result)
        onSuccess(request.result)
        return
    }
}
contextBridge.exposeInMainWorld('CreateDialogs', CreateDialogs)
contextBridge.exposeInMainWorld('ReadDialogs', ReadDialogs)
