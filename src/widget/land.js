import React, { useState } from 'react'
import LoginDiv from './login'
import { SessionPanel } from './chat'
import FoundPage from './found'
import NetworkPanel from './network'
import NavBar from './nav'
import CallPopup from './popup'
import { LivePage } from './live'
import Post from './post'
import PostPage from './post'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer
export default function LandingPage({ handleLogout, sessionID, localID, handleVideoCallOut, handleVoiceCallOut, onSelected }) {

    const [state, setState] = useState({
        tab: <NetworkPanel sessionID={sessionID} />
    });

    function handleSwitchTab(e) {
        e.preventDefault()
        switch (e.target.id) {
            case 'Chat':
                setState({
                    tab: <SessionPanel sessionID={sessionID} localID={localID} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} onSelected={onSelected} />
                })
                break
            case 'Network':
                setState({
                    tab: <NetworkPanel sessionID={sessionID} />
                })
                break
            case 'Search':
                setState({
                    tab: <FoundPage sessionID={sessionID} />
                })
                break
            case 'Found':
                setState({
                    tab: <div className='p-2'>found</div>
                })
                break
            case 'Post':
                setState({
                    tab: <PostPage sessionID={sessionID}/>
                })
                break
            case 'Live':
                setState({
                    tab: <LivePage sessionID={sessionID} />
                })
                break
            case 'Wallet':
                setState({
                    tab: <div className='p-2'>Wallet</div>
                })
                break
            case 'Exchange':
                setState({
                    tab: <div className='p-2'>Exchange</div>
                })
                break
            case 'setting':
                setState({
                    tab: <div className='p-2'>Setting</div>
                })
                break
            default:
                setState({
                    tab: <SessionPanel sessionID={sessionID} localID={localID} onSelected={onSelected} />
                })
        }
    }

    return (
        <>
            <div className='static'>
                <div className='z-10 flex flex-row h-screen'>
                    <NavBar handleSwitchTab={handleSwitchTab} handleLogout={handleLogout} />
                    {state.tab}
                </div>
            </div>
        </>

    )
}