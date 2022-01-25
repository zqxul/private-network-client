import 'tailwindcss/tailwind.css'
import React, { useState, useEffect } from 'react'
import Avartar from './avartar'
import { result } from 'lodash'
import { data } from 'autoprefixer'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

export function SessionPanel({ sessionID, handleVideoCallOut, handleVoiceCallOut, onSelected }) {

    const [state, setstate] = useState({
        currentID: null,
    })

    const [load, setLoad] = useState(false)
    const [dialogs, setDialogs] = useState([])

    if (!load) {
        window.ReadDialogs(result => {
            let remoteIDs = result.map(item => item.remoteID)
            let briefInfoResult = ipcRenderer.sendSync('BriefInfos', { sessionID: sessionID, networkIDs: remoteIDs })
            if (briefInfoResult && briefInfoResult.infos) {
                let newDialogs = briefInfoResult.infos.map(item => {
                    return {
                        nickname: item.nickname,
                        networkID: item.networkID,
                        userID: item.userID
                    }
                })
                console.log('current dialogs: ', dialogs, 'load dialogs: ', newDialogs)
                setLoad(true)
                setDialogs(newDialogs)
            }

        })
    }

    function handleChange(e) {
        let keyword = e.target.value
        console.log(keyword)
    }

    function handleSelect(selectedID) {
        setstate({
            currentID: selectedID
        })
        onSelected(selectedID)
    }

    return (
        <div className='flex flex-row w-11/12'>
            <div className='flex flex-col w-4/12 space-y-2 border-r'>
                <div className='border-b p-2'>
                    <input className='rounded-xl border w-full px-2 placeholder:p-2 placeholder:text-sm' placeholder='keyword' onChange={handleChange} />
                </div>
                <DialogList currentID={state.currentID} dialogs={dialogs} handleSelect={handleSelect} />
            </div>
            {state.currentID ? <SessionBox sessionID={sessionID} remoteID={state.currentID} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} /> : null}
        </div>
    )
}

function DialogList({ currentID, dialogs, handleSelect }) {
    return (
        <div className='px-2 space-y-2 h-screen overflow-y-auto overflow-x-hidden'>
            {dialogs.map((dialog, index) =>
                <SessionItem id={dialog.networkID} handleSelect={handleSelect} current={currentID === dialog.networkID} key={dialog.networkID} imageUrl={dialog.imageUrl} title={dialog.nickname} overview={dialog.nickname} />
            )}
        </div>
    )
}

function SessionItem({ id, imageUrl, title, overview, current, handleSelect }) {

    const [menu, setMenu] = useState({
        leftWidth: '100%',
        rightWidth: '0%'
    })

    function handleClick(e) {
        console.log('handle' + e.target)
        e.preventDefault()
        handleSelect(id)
    }

    function handleMouseDown(e) {
        console.log(3 / 4)
        // console.log('mouse down')
        let startX = e.clientX
        console.log('Start X: ', e.clientX, 'Start Y: ', e.clientY)
        let leftBorder = e.target.clientLeft
        let rightBorder = leftBorder + e.target.clientWidth
        let splitBorder = Math.floor(rightBorder - e.target.clientWidth / 3)
        if (splitBorder < startX && startX < rightBorder) {
            e.target.addEventListener('mousemove', e => {
                // console.log('End X: ', e.clientX, 'End Y: ', e.clientX)
                let distince = startX - e.clientX
                let right = e.target.clientLeft + e.target.clientWidth
                let leftWidth = Math.floor((e.target.clientWidth - distince) / e.target.clientWidth * 100)
                let rightWidth = 100 - leftWidth
                console.log('leftWidth: ', leftWidth, 'rightWidth: ', rightWidth)
                setMenu({
                    leftWidth: leftWidth + '%',
                    rightWidth: rightWidth + '%'
                })
                // console.log('distince: ', distince)
            })
        }
    }

    let showStyle = current ?
        'p-4 h-20 flex flex-row shadow border rounded-lg text-sm bg-gray-200' :
        'p-4 h-20 flex flex-row shadow border rounded-lg text-sm '

    return (
        <div className='w-full flex flex-row' onClick={handleClick} onMouseDown={handleMouseDown}>
            <div className={showStyle} style={{ width: menu.leftWidth, minWidth: '70%' }}>
                <Avartar imageUrl={imageUrl} />
                <Overview title={title} overview={overview} />
            </div>
            <div className='text-xs flex flex-col justify-center bg-red-500 overflow-hidden' style={{ width: menu.rightWidth, maxWidth: '30%' }}>
                <button>删除</button>
            </div>
        </div>
    )
}

export function SessionBox({ sessionID, remoteID, handleVideoCallOut, handleVoiceCallOut }) {

    const [init, setInit] = useState(false)
    const [words, setWords] = useState([])

    if (!init) {
        window.ReadMessages(remoteID, result => {
            console.log('read messages: ', result)
            setInit(true)
            setWords(result)
        })
    }

    window.setOnMessage(data => {
        if (remoteID === data.remoteID) {
            const newWords = [...words]
            newWords.push(data)
            setWords(newWords)
        }
    })

    window.setOnMessageAck(data => {
        console.log('send message ack: ', data)
        window.DB.createDialogItem(data)
        const newWords = [...words]
        newWords.push(data)
        setWords(newWords)
    })

    return sessionID ?
        (
            <div className='p-2 w-8/12 flex flex-col'>
                <ToolBar sessionID={sessionID} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} />
                <Dialogue sessionID={sessionID} remoteID={remoteID} messages={words} />
                <InputBox sessionID={sessionID} remoteID={remoteID} />
            </div>
        ) : (
            <div className='p-2 w-8/12 flex flex-col'>nothing</div>
        )
}

function ToolBar({ sessionID, handleVideoCallOut, handleVoiceCallOut }) {

    return (
        <div className='p-2 flex flex-row-reverse h-10'>
            <button className='m-1 text-sm' onClick={handleVideoCallOut}><i className='bi bi-camera-video-fill'></i></button>
            <button className='m-1 text-sm' onClick={handleVoiceCallOut}><i className="bi-telephone-fill"></i></button>
        </div>
    )
}

function Dialogue({ sessionID, remoteID, messages }) {

    return (
        <div className='m-1 p-4 border h-5/6 shadow flex flex-col overflow-y-auto overflow-x-clip'>
            {
                messages.map(message => (
                    <MessageItem key={message.msgID} message={message} />
                ))
            }
            {/* <div className='mb-5 odd:text-right'>
                <p className='text-gray-300 text-xs'>14:40:31</p>
                <p className='text-sm'>good morning neighbor</p>
            </div>
            <div className='mb-5 odd:text-right'>
                <p className='text-gray-300 text-xs'>18:19:12</p>
                <p className='text-sm'>fuck you</p>
            </div>
            <div className='mb-5 odd:text-right'>
                <p className='text-gray-300 text-xs'>20:40:11</p>
                <p className='text-sm'> fuck you too</p>
            </div> */}
        </div >
    )
}

function MessageItem({ message }) {
    let time = new Date(message.timestamp)
    return (
        <div className='mb-5 odd:text-right'>
            <p className='text-gray-300 text-xs'>{time.toDateString()}</p>
            <p className='text-sm'>{message.body}</p>
        </div>
    )
}

function InputBox({ sessionID, remoteID }) {

    const [message, setMessage] = useState({
        type: null,
        body: null
    })

    function handleChange(e) {
        setMessage({
            type: 'text',
            body: e.target.value
        })
    }

    function handleSendMessage(e) {
        console.log("send message: ", message)
        let enc = new TextEncoder()
        let body = enc.encode(message.body)
        let msg = {
            type: 'message',
            localID: sessionID,
            remoteID: remoteID,
            message: {
                type: message.type,
                body: body
            }
        }
        ipcRenderer.send('signal', msg)
    }

    return (
        <div className='m-1 p-2 border h-1/6'>
            <div className='h-1/4 flex flex-row border-b border-dashed justify-between'>
                <ul className='flex flex-row'>
                    <li className='m-1 border text-sm'><i className="bi bi-emoji-smile"></i></li>
                    <li className='m-1 border text-sm'><i className="bi bi-images"></i></li>
                    <li className='m-1 border text-sm'><i className="bi bi-files"></i></li>
                    <li className='m-1 border text-sm'><i className="bi bi-camera"></i></li>
                    <li className='m-1 border text-sm'><i className="bi bi-webcam"></i></li>
                    <li className='m-1 border text-sm'><i className="bi bi-mic"></i></li>
                </ul>
            </div >
            <div className='pt-2 pl-1 h-3/4 flex flex-row'>
                <input className='h-full w-full' placeholder='input text' onChange={handleChange} />
                <button className='w-2/12 text-3xl' onClick={handleSendMessage}><i className='bi bi-send-fill'></i></button>
            </div>
        </div >
    )
}

function Overview({ title, overview }) {
    return (
        <div className='mx-2 overflow-hidden justify-between'>
            <h1 className='font-bold'>{title}</h1>
            <p className='font-thin'>{overview}</p>
        </div >
    )
}