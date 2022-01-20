import 'tailwindcss/tailwind.css'
import React, { useState } from 'react'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

export default function FoundPage({ sessionID }) {

    const [selected, setSelected] = useState('FindFriend')

    function handleClick(e) {
        e.preventDefault()
        setSelected(e.target.value)
    }

    let current = null
    switch (selected) {
        case 'FindFriend':
            current = <FindFriend sessionID={sessionID} />
            break
        case 'FriendApply':
            current = <FriendApply sessionID={sessionID} />
            break
        default:
            break
    }

    return (
        <div>
            <ol className='flex flex-row text-sm p-2'>
                <li className='border p-1'>
                    <button className='p-2 bg-lime-500' value="FriendApply" onClick={handleClick}>好友申请</button>
                </li>
                <li className='border p-1'>
                    <button className='p-2 bg-lime-500' value="FindFriend" onClick={handleClick}>发现小伙伴</button>
                </li>
            </ol>
            <div className='p-2'>
                {current}
            </div>
        </div>
    )
}

function FindFriend({ sessionID }) {

    const [infos, setInfos] = useState([])

    function handleChange(e) {
        e.preventDefault()
        let kw = e.target.value
        if (kw) {
            let result = ipcRenderer.sendSync('findFriend', { sessionID: sessionID, keyword: kw })
            if (result && result.users) {
                setInfos(result.users)
            }
        } else {
            setInfos([])
        }
    }

    return (
        <div className='h-screen w-screen border flex flex-col justify-center space-y-12'>
            <div className='h-10 py-1 border text-center'>
                <input className='w-7/12 h-full rounded-full border px-2 placeholder:p-2 placeholder:text-sm' placeholder='keyword' onChange={handleChange} />
            </div>
            <div className='h-64 border flex flex-row justify-center'>
                <ol className='border w-8/12 p-2 grid grid-cols-4 gap-1 grid-rows-3 text-xs'>
                    {infos.map(info => <FriendItem key={info.userID} sessionID={sessionID} info={info} />)}
                </ol>
            </div>
        </div>
    )
}
function FriendItem({ sessionID, info }) {

    function handleClick(e) {
        e.preventDefault()
        let result = ipcRenderer.sendSync('apply', {
            sessionID: sessionID,
            networkID: info.networkID
        })
        if (result && result.applyID) {
            alert('waiting for reviewing')
        }
    }

    return (
        <li className='border py-2 px-3 flex flex-col justify-around bg-lime-600 text-xs rounded-md'>
            <div className='flex flex-row justify-between'>
                <span>{info.nickname}</span>
            </div>
            <button className='border text-xs w-5 bg-slate-400' value={info.networkID} onClick={handleClick}>+</button>
        </li>
    )
}

export function FriendApply({ sessionID }) {

    let result = loadFriendApply()

    const [page, setPage] = useState({
        current: 1,
        size: 10,
        perSize: 10,
        list: result.applys ? result.applys : [],
    })

    function loadFriendApply() {
        let result = ipcRenderer.sendSync('applyList', {
            sessionID: sessionID
        })
        return result
    }


    return (
        <div className='border grid grid-cols-4 gap-3'>
            {page.list.map(item => <FriendApplyItem key={item.applyID} applyInfo={item} sessionID={sessionID} onSuccess={loadFriendApply} />)}
        </div>
    )
}

function FriendApplyItem({ applyInfo, sessionID, onSuccess }) {

    function handleClick(e) {
        e.preventDefault()
        let result = ipcRenderer.sendSync('review', {
            sessionID: sessionID,
            applyID: applyInfo.applyID,
            result: e.target.value === 'true'
        })
        if (result && result.userID) {
            console.log("review success")
            onSuccess()
        }
    }

    return (
        <div className='border flex flex-row'>
            <div className='w-3/5 p-2 border'>
                <span className='text-sm'>{applyInfo.nickname}</span>
            </div>
            <div className='w-2/5 p-2 flex flex-col space-y-1'>
                <button onClick={handleClick} value={true} className=' bg-sky-300 text-xs border'>agree</button>
                <button onClick={handleClick} value={false} className=' bg-red-400 text-xs border'>reject</button>
            </div>
        </div>
    )
}