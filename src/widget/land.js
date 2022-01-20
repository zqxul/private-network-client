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
export default function LandingPage({ handleLogout, sessionID, onOffer }) {

    const [state, setState] = useState({
        tab: <NetworkPanel onOffer={onOffer} sessionID={sessionID} />
    });

    function handleSwitchTab(e) {
        e.preventDefault()
        switch (e.target.value) {
            case 'Chat':
                setState({
                    tab: <SessionPanel sessionID={sessionID} />
                })
                break
            case 'Network':
                setState({
                    tab: <NetworkPanel onOffer={onOffer} sessionID={sessionID} />
                })
                break
            case 'Found':
                setState({
                    tab: <FoundPage sessionID={sessionID} />
                })
                break
            case 'Post':
                setState({
                    tab: <div>post</div>
                })
                break
            case 'Live':
                setState({
                    tab: <LivePage />
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