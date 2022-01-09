import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import LandingPage from './widget/land'
import LoginPanel from './widget/login'
import CallPopup from './widget/popup'
// import "../index.css"

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

var root = document.getElementById('root')

var pc = null

function MainPage() {

    const [state, setState] = useState({
        sessionID: '',
        timeout: 10
    });

    const [ringing, setRinging] = useState(false)
    const [direction, setDirection] = useState('in')
    const [rtcState, setRtcState] = useState({
        remoteID: '',
        sdp: null,
        ice: ''
    })

    function createPeerConnection() {
        pc = new RTCPeerConnection()
        // pc = new RTCPeerConnection({
        //     iceServers: [
        //         {
        //             urls: 'turn:numb.viagenie.ca',
        //             credential: 'muazkh',
        //             username: 'webrtc@live.com'
        //         }
        //     ]
        // })
        pc.onicecandidate = handleICECandidate
        pc.ontrack = handleTrack
        pc.onnegotiationneeded = handleNegotiationNeeded
        pc.oniceconnectionstatechange = handleICEConnectionStateChange
        pc.onicegatheringstatechange = handleICEGatheringStateChange
    }

    function handleICECandidate(e) {
        if (e.candidate) {
            ipcRenderer.send('signal', {
                type: 'candidate',
                localID: sessionID,
                remoteID: remoteID,
                candidate: e.candidate
            })
        }
    }

    function handleTrack(e) {
        document.getElementById("remote").srcObject = e.streams[0]
    }

    function closeVideo() {
        let localVideo = document.getElementById('video')
        let remoteVideo = document.getElementById('remote')
        if (pc) {
            pc.ontrack = null;
            pc.onremovetrack = null;
            pc.onremovestream = null;
            pc.onicecandidate = null;
            pc.oniceconnectionstatechange = null;
            pc.onsignalingstatechange = null;
            pc.onicegatheringstatechange = null;
            pc.onnegotiationneeded = null;
            pc.close()
            pc = null
        }
        if (localVideo && localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
            localVideo.removeAttribute('srcObject')
        }
        if (remoteVideo && remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            remoteVideo.removeAttribute('srcObject')
        }
    }

    function handleNegotiationNeeded(e) { }

    function handleICEConnectionStateChange(e) { }

    function handleICEGatheringStateChange(e) { }

    function handleSignalingStateChange(e) { }

    function handleOffer(e, selectedFriend) {
        createPeerConnection()
        if (pc) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    document.getElementById("video").srcObject = stream
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream)
                    })
                }, err => {
                    console.log(err)
                })
        }
        pc.createOffer()
            .then(offer => {
                return pc.setLocalDescription(offer)
            })
            .then(() => {
                console.log(pc.localDescription)
                ipcRenderer.send('signal', {
                    type: 'offer',
                    localID: state.sessionID,
                    remoteID: selectedFriend.networkID,
                    sdp: {
                        type: pc.localDescription.type,
                        sdp: pc.localDescription.sdp
                    }
                })
            }).then(() => {
                window.setOnOfferAck(msg => {

                })
            }).then(() => {
                handlePopup(e)
            })
    }

    function handleAnswer() {
        if (rtcState.sdp) {
            createPeerConnection()
            let sdp = new RTCSessionDescription(rtcState.sdp);
            pc.setRemoteDescription(sdp)
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    console.log('add answer stream')
                    document.getElementById("video").srcObject = stream
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream)
                    })
                }, err => {
                    console.log(err)
                })
                .then(() => pc.createAnswer())
                .then(answer => pc.setLocalDescription(answer))
                .then(() => {
                    ipcRenderer.send('signal', {
                        type: 'answer',
                        localID: state.sessionID,
                        remoteID: rtcState.remoteID,
                        sdp: {
                            type: pc.localDescription.type,
                            sdp: pc.localDescription.sdp
                        }
                    })
                })
                .then(() => {
                    window.setOnAnswerAck(msg => {

                    })
                })
        }
    }

    function handleHangup() {
        if (pc) {
            ipcRenderer.send('signal', {
                type: 'end',
                localID: state.sessionID,
                remoteID: rtcState.remoteID,
                sdp: {
                    type: pc.localDescription.type,
                    sdp: pc.localDescription.sdp
                }
            })
            window.setOnEndAck(msg => {

            })
            closeVideo()
        }
        setRinging(false)
        setDirection('')
    }

    function handleLogin(sessionID) {
        if (sessionID) {
            let newState = { ...state }
            newState.sessionID = sessionID
            newState.timeout = 30 * 60 * 1000
            setState(newState)
        }

        window.setOnOffer(msg => {
            setRtcState({
                remoteID: msg.remoteID,
                sdp: msg.sdp,
                ice: msg.ice
            })
            setRinging(true)
        })
        window.setOnAnswer(msg => {
            setRtcState({
                remoteID: msg.remoteID,
                sdp: msg.sdp,
                ice: msg.ice
            })
            setRinging(true)
        })
        window.setOnEnd(msg => {
            closeVideo()
            setRinging(false)
            clearRtc()
        })
    }

    function clearRtc() {
        setRtcState({
            remoteID: '',
            sdp: '',
            ice: ''
        })
    }

    function handlePopup(e) {
        setRinging(true)
        setDirection(e.target.value)
    }

    function handleReject() {
        ipcRenderer.send('signal', {
            type: 'reject',
            localID: state.sessionID,
            remoteID: rtcState.remoteID
        })
        setRinging(false)
        clearRtc()
    }

    function handleLogout() {
        let result = ipcRenderer.sendSync('logout', { sessionID: state.sessionID })
        console.log('logout result: ')
        if (result && result.userID) {
            setState({
                sessionID: '',
                timeout: 0
            })
        }
    }


    return (
        state.sessionID && state.timeout > 0 ?
            <div className='static'>
                <LandingPage handleLogout={handleLogout} onOffer={handleOffer} sessionID={state.sessionID} />
                {
                    ringing ? (
                        <CallPopup sessionID={state.sessionID} direction={direction} onReject={handleReject} onAnswer={handleAnswer} onHangup={handleHangup} remoteID={rtcState.remoteID} />
                    ) : null
                }
            </div> : <LoginPanel handleLogin={handleLogin} />
    )
}

ReactDOM.render(<MainPage />, root)
