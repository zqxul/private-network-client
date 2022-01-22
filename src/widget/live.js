import React, { useState } from 'react'
import '../index.css'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

const mimeType = "video/webm;codecs=opus, vp9"

function loadLives(sessionID) {
    let result = ipcRenderer.sendSync('list', { sessionID: sessionID, page: 1, size: 10 })
    console.log('load live list result: ', result)
    if (result && result.userID && result.list) {
        return { total: result.total, list: result.list }
    }
    return { total: 0, list: [] }
}

export function LivePage({ sessionID }) {

    const [host, setHost] = useState(false)

    const initState = loadLives(sessionID)
    console.log('init state: ', initState)

    const [state, setState] = useState({
        page: 1,
        size: 10,
        total: initState.total,
        list: initState.list
    })

    const [curRoomID, setCurRoomID] = useState('')

    const [showAudience, setShowAudience] = useState(false)

    function handleToggle(e) {
        const toggle = host
        let result = null
        if (toggle) {
            result = ipcRenderer.sendSync('close', { sessionID: sessionID })
        } else {
            result = ipcRenderer.sendSync('new', { sessionID: sessionID })
        }
        if (result && result.userID && result.roomID) {
            setHost(!toggle)
        }
    }

    function handleEnterRoom(e) {
        e.preventDefault()
        let curRoomID = e.target.value
        if (!host) {
            let result = ipcRenderer.sendSync('enter', { sessionID: sessionID, roomID: curRoomID })
            if (result && result.userID && result.hostID) {
                setShowAudience(true)
                setCurRoomID(curRoomID)
            }
        }
    }

    function handleExitRoom(e) {
        if (!host) {
            let result = ipcRenderer.sendSync('exit', { sessionID: sessionID, roomID: e.target.value })
            if (result && result.userID && result.hostID) {
                setShowAudience(false)
            }
        }
    }

    return (
        <div className='flex flex-row w-11/12 text-xs'>
            <div className='flex flex-col w-4/12 space-y-2 border-r'>
                <div className='border-b px-8 py-2'>
                    <button className='rounded-xl border w-full' onClick={handleToggle}>{host ? "关闭房间" : "创建房间"}</button>
                </div>
                <ul className='px-2 space-y-2 h-screen overflow-y-auto overflow-x-hidden'>
                    {state.list.map(item => <RoomItem key={item.roomID} info={item} handleEnterRoom={handleEnterRoom} />)}
                </ul>
            </div>
            <div className='w-8/12'>
                {host ? <HostPage sessionID={sessionID} /> : (showAudience ? <AudiencePage roomID={curRoomID} handleExitRoom={handleExitRoom} /> : null)}
            </div>
        </div>
    )
}

function RoomItem({ info, handleEnterRoom }) {
    return (
        <li className='flex flew-row text-xs'>
            <div className='border w-3/12'>头像</div>
            <div className='border w-9/12'>
                <div className='border text-center'>{"房间名称"}</div>
                <div className='flex flew-row justify-between'>
                    <div className='text-center w-6/12'>热度:{info.total}</div>
                    <button className='border w-6/12 px-2 py-1 bg-sky-500' value={info.roomID} onClick={handleEnterRoom}>进入房间</button>
                </div>
            </div>
        </li>
    )
}

export function HostPage({ sessionID }) {

    let liveingRecorder = null
    let localStream = null

    function handleStart(e) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStream = stream
            }, err => {
                console.log(err)
            }).then(() => {

                document.getElementById('stream1').srcObject = localStream

                let mediaSource = new MediaSource()
                mediaSource.addEventListener('sourceopen', () => {
                    console.log('source opened..')
                    let sourceBuffer = mediaSource.addSourceBuffer(mimeType)
                    liveingRecorder = new MediaRecorder(localStream, { mimeType: mimeType })
                    liveingRecorder.ondataavailable = chunk => {

                        chunk.data.arrayBuffer().then(buffer => {
                            // send buffer to server
                            ipcRenderer.send('signal', {
                                type: 'live',
                                localID: sessionID,
                                stream: new Uint8Array(buffer)
                            })
                            if (sourceBuffer) {
                                sourceBuffer.appendBuffer(buffer)
                            }
                        })

                        // chunk.data.arrayBuffer().then(buffer => {
                        //     console.log('buffer:', new Uint8Array(buffer))
                        // })
                    }
                    liveingRecorder.start(2000)
                }, false)
                document.getElementById('stream2').src = URL.createObjectURL(mediaSource)

            })
    }

    function play() {

    }

    function handleStop(e) {
        liveingRecorder.stop()
        localStream.getTracks().forEach(track => track.stop());
        localStream = null
        liveingRecorder = null
    }

    return (
        <div className='p-2 flex flex-col'>
            <div className='flex flex-row'>
                <button className='border p-2 bg-blue-500' onClick={handleStart}>开始直播</button>
                <button className='border p-2 bg-orange-600' onClick={handleStop}>结束直播</button>
            </div>
            <div className='p-2 flex flex-row'>
                <video className='border h-30 w-30' id='stream2' controls autoPlay muted />
                <video className='border h-20 w-20' id='stream1' controls autoPlay muted />
            </div>
        </div>
    )
}

function AudiencePage({ roomID, handleExitRoom }) {

    let mediaSource = new MediaSource()
    mediaSource.addEventListener('sourceopen', () => {
        console.log('source opened..')
        let sourceBuffer = mediaSource.addSourceBuffer(mimeType)
        window.setOnLiveStream(data => {
            if (sourceBuffer) {
                sourceBuffer.appendBuffer(data.stream)
            }
        })
    }, false)
    let src = URL.createObjectURL(mediaSource)

    return (
        <div className='text-xs h-screen w-full flex flex-col'>
            <div className='border h-4/6'>
                <video id='audience' className='w-full h-full' src={src} controls autoPlay />
            </div>
            <div className='p-2 h-1/6 flex flex-row'>
                <button className='border p-2' value={roomID} onClick={handleExitRoom}>退出房间</button>
            </div>
            <div className=' h- '>
                comment
            </div>
        </div>
    )
}