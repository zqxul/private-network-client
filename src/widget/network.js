import 'tailwindcss/tailwind.css'
import React, { useState } from 'react'
import CallPopup from './popup'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

function loadFriends(sessionID) {
    return ipcRenderer.sendSync('addrBook', {
        sessionID: sessionID
    })
}
export default function NetworkPanel({ sessionID }) {

    let result = loadFriends(sessionID)
    let initFriends = result && result.friends ? result.friends : []

    const [friends, setFriends] = useState(initFriends)

    const [selectedFriend, setselectedFriend] = useState({})

    function handleChange(e) {
        e.preventDefault()
        let keyword = e.target.value
        if (keyword) {
            console.log(keyword)
            let newFriends = friends.filter(friend => friend.nickname.contains(keyword))
            setFriends(newFriends)
        }
    }

    function handleSelect(info) {
        let newFriends = friends.map(friend => {
            friend.selected = (friend.networkID === info.networkID)
            return friend
        })
        setFriends(newFriends)
        setselectedFriend(info)
    }

    // 新建会话
    function handleNewSession(e) {
        e.preventDefault()
        console.log('create session')
        window.DB.createDialog({
            id: selectedFriend.networkID,
            title: selectedFriend.nickname,
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            overview: 'about what'
        })
    }

    return (
        <div className='flex flex-row w-11/12'>
            <div className='flex flex-col w-4/12 space-y-2 border-r'>
                <div className='border-b p-2'>
                    <input className='rounded-xl border w-full px-2 placeholder:p-2 placeholder:text-sm' placeholder='keyword' onChange={handleChange} />
                </div>
                <div className='px-2 space-y-2 h-screen overflow-y-auto overflow-x-hidden'>
                    {friends.map(friend => <FriendItem key={friend.userID} info={friend} handleSelect={handleSelect} />)}
                </div>
            </div>
            {
                selectedFriend.userID ?
                    <div>
                        <div>
                            <span>{selectedFriend.nickname}</span>
                        </div>
                        <div>动态</div>
                        <div>相册</div>
                        <div>说说</div>
                        <div className='flex flex-rows space-x-3 text-xs font-thin'>
                            <button className='border bg-sky-400 p-2' onClick={handleNewSession}>新建会话</button>
                        </div>
                    </div> : null
            }
        </div>
    )
}

function FriendItem({ info, selected, handleSelect }) {

    function handleClick(e) {
        e.preventDefault()
        handleSelect(info)
    }

    let showStyle = info.selected ?
        'p-4 h-20 flex flex-row shadow border rounded-lg text-sm bg-gray-200' :
        'p-4 h-20 flex flex-row shadow border rounded-lg text-sm'
    return (
        <div id={info.networkID} className={showStyle} onClick={handleClick}>
            <div className='mx-2 overflow-hidden justify-between'>
                <h1 className='font-bold'>{info.nickname}</h1>
            </div >
        </div>
    )
}