import React, { useState } from 'react'

// const electron = window.electron

// const ipcRenderer = electron.ipcRenderer


export function LivePage({ }) {

    let liveingRecorder = null
    let localStream = null

    let buffers = []
    let start = 0
    let end = 0
    const mimeType = "video/webm;codecs=opus, vp9"
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
                            buffers.push(buffer)
                            if (sourceBuffer) {
                                sourceBuffer.appendBuffer(buffer)
                            }
                        })

                        // chunk.data.arrayBuffer().then(buffer => {
                        //     console.log('buffer:', new Uint8Array(buffer))
                        // })
                    }
                    liveingRecorder.start(1000)
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