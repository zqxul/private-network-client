import 'tailwindcss/tailwind.css'
import React, { useState, useEffect } from 'react'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

function Timer({ }) {

    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const [second, setSecond] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = second + 1
            const minutes = minute + Math.floor(seconds / 60)
            const hours = hour + Math.floor(minutes / 60)
            setSecond((seconds) % 60)
            setMinute(minutes % 60)
            setHour(hours % 60)
        }, 1000)
        return () => clearInterval(interval)
    })

    return (
        <div className='text-lg border text-center'>
            <span>{hour < 10 ? '0' + hour : hour}</span>:
            <span>{minute < 10 ? '0' + minute : minute}</span>:
            <span>{second < 10 ? '0' + second : second}</span>
        </div>
    )
}

export default function CallPopup({ sessionID, remoteID, direction, onReject, onAnswer, onHangup }) {

    const [state, setState] = useState({
        pickup: false,
        hangup: false,
        reject: false
    })

    if (direction === 'out') {
        ipcRenderer.on('answer', (e, arg) => {
            setState({
                pickup: true,
                hangup: false,
                reject: false
            })
        })
    }

    function handlePickup(e) {
        e.preventDefault()
        onAnswer()
        setState({
            pickup: true,
            hangup: false,
            reject: false
        })
    }

    function handleReject(e) {
        e.preventDefault()
        onReject()
        setState({
            pickup: false,
            hangup: false,
            reject: false
        })
    }

    function handleHangup(e) {
        e.preventDefault()
        onHangup()
        setState({
            pickup: false,
            hangup: true,
            reject: false
        })
    }

    return (
        <div className={'w-screen h-screen flex flex-row justify-center absolute top-0'}>
            <div className='h-72 w-64 border shadow-2xl bg-green-100 flex flex-col'>
                <div className='h-3/4 flex flew-col p-2 relative'>
                    <span className='border p-2 absolute'>ringing</span>
                    <div className='flex flwx-row justify-center'>
                        <video className='border w-1/2' id='video' autoPlay></video>
                        <video className='border w-1/2' id='remote' autoPlay></video>
                    </div>
                </div>
                <div className='h-1/4 text-xs flex flex-col justify-center'>
                    {
                        state.pickup ? (
                            <Timer />
                        ) : (
                            direction === 'in' ?
                                (
                                    <div className='flex flex-row justify-around'>
                                        <button className='w-14 h-14 rounded-full bg-green-500' onClick={handlePickup}>接听</button>
                                        <button className='w-14 h-14 rounded-full bg-red-500' onClick={handleReject}>拒接</button>
                                    </div>
                                ) :
                                (
                                    <div className='flex flex-row justify-center'>
                                        <button className='w-14 h-14 rounded-full bg-red-500' onClick={handleHangup}>挂断</button>
                                    </div>
                                )
                        )
                    }
                </div>
            </div>
        </div>
    )
}