import React, { useState } from 'react'
import LoginDiv from './login'
import { SessionPanel } from './chat'
import FindPage from './find'
import NetworkPanel from './network'
import NavBar from './nav'
import CallPopup from './popup'
import { LivePage } from './live'
import ExplorePage from './explore'
import PostPage from './post'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer
export default function LandingPage({ handleLogout, sessionID, localID, handleVideoCallOut, handleVoiceCallOut, onSelected }) {

    const [tab, setTab] = useState(<NetworkPanel sessionID={sessionID} />)

    function handleSwitchTab(e) {
        e.preventDefault()
        switch (e.target.id) {
            case 'Chat':
                setTab(<SessionPanel sessionID={sessionID} localID={localID} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} onSelected={onSelected} />)
                break
            case 'Network':
                setTab(<NetworkPanel sessionID={sessionID} />)
                break
            case 'Search':
                setTab(<FindPage sessionID={sessionID} />)
                break
            case 'Found':
                setTab(<ExplorePage sessionID={sessionID} />)
                break
            case 'Post':
                setTab(<PostPage />)
                break
            case 'Live':
                setTab(<LivePage sessionID={sessionID} />)
                break
            case 'Wallet':
                setTab(<div className='p-2'>Wallet</div>)
                break
            case 'Exchange':
                setTab(<div className='p-2'>Exchange</div>)
                break
            case 'setting':
                setTab(<div className='p-2'>Setting</div>)
                break
            default:
                setTab(<SessionPanel sessionID={sessionID} localID={localID} onSelected={onSelected} />)
        }
    }

    return (
        <>
            <div className='static'>
                <div className='z-10 flex flex-row h-screen'>
                    <NavBar handleSwitchTab={handleSwitchTab} handleLogout={handleLogout} />
                    {tab}
                </div>
            </div>
        </>

    )
}