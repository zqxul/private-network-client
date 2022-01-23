import React, { useState } from 'react'
import LoginDiv from './login'
import { SessionPanel } from './chat'
import FoundPage from './found'
import NetworkPanel from './network'
import NavBar from './nav'
import CallPopup from './popup'
import { LivePage } from './live'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer
export default function LandingPage({ handleLogout, sessionID, handleVideoCallOut, handleVoiceCallOut, onSelected }) {

    const [state, setState] = useState({
        tab: <NetworkPanel sessionID={sessionID} />
    });

    function handleSwitchTab(e) {
        e.preventDefault()
        switch (e.target.id) {
            case 'Chat':
                setState({
                    tab: <SessionPanel sessionID={sessionID} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} onSelected={onSelected} />
                })
                break
            case 'Network':
                setState({
                    tab: <NetworkPanel sessionID={sessionID} />
                })
                break
            case 'Found':
                setState({
                    tab: <FoundPage sessionID={sessionID} />
                })
                break
            case 'Post':
                setState({
                    tab: <div className='p-2'>post</div>
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
            default:
                setState({
                    tab: <SessionPanel sessionID={sessionID} />
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