import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import LandingPage from './widget/land'
import LoginPanel from './widget/login'
import CallPopup from './widget/popup'

const electron = window.electron

const ipcRenderer = electron.ipcRenderer

var root = document.getElementById('root')

var pc = null
var sessionID = ''
var remoteID = ''
var timeout = 10

function MainPage() {

    const [state, setState] = useState({
        sessionID: '',
        timeout: 10
    });

    const [ringing, setRinging] = useState(false)
    const [direction, setDirection] = useState('in')

    function createPeerConnection() {
        if (pc) {
            console.log('pc already setup')
            return
        }
        console.log('setup peer connection')
        // pc = new RTCPeerConnection()
        pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:numb.viagenie.ca',
                    // urls: 'stun:stun.schlund.de',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                }
                // {
                //     urls: "turn:localhost",  // A TURN server
                //     username: "webrtc",
                //     credential: "turnserver"
                // }
            ]
        })
        pc.ontrack = handleTrack
        pc.onicecandidate = handleICECandidate
        pc.onnegotiationneeded = handleNegotiationNeeded
        pc.onsignalingstatechange = handleSignalingStateChange
        pc.onicegatheringstatechange = handleICEGatheringStateChange
        pc.oniceconnectionstatechange = handleICEConnectionStateChange
    }

    function handleTrack(e) {
        console.log("*** Track event ***");
        document.getElementById("remote").srcObject = e.streams[0]
    }

    function handleICECandidate(e) {
        console.log('*** ice candidate ')
        if (e.candidate) {
            console.log('handle ice candidate ', e.candidate.candidate)
            ipcRenderer.send('signal', {
                type: 'candidate',
                localID: sessionID,
                remoteID: remoteID,
                candidate: {
                    candidate: e.candidate.candidate,
                    sdpMLineIndex: e.candidate.sdpMLineIndex,
                    sdpMid: e.candidate.sdpMid,
                    usernameFragment: e.candidate.usernameFragment
                }
            })
        }
    }

    function handleNegotiationNeeded(e) {
        console.log('*** negotiation needed')
        if (pc.signalingState != "stable") {
            console.log("The connection isn't stable yet; postponing...")
            return
        }
        console.log('sessionID: ', sessionID)
        console.log('remoteID: ', remoteID)
        if (sessionID && remoteID) {
            pc.createOffer()
                .then(offer => {
                    return pc.setLocalDescription(offer)
                })
                .then(() => {
                    console.log(pc.localDescription)
                    ipcRenderer.send('signal', {
                        type: 'offer',
                        localID: sessionID,
                        remoteID: remoteID,
                        sdp: {
                            type: pc.localDescription.type,
                            sdp: pc.localDescription.sdp
                        }
                    })
                })
        }
    }

    function handleSignalingStateChange(e) {
        console.log("*** WebRTC signaling state changed to: " + pc.signalingState);
        switch (pc.signalingState) {
            case "closed":
                closeVideo();
                break;
        }
    }

    function handleICEGatheringStateChange(e) {
        console.log("*** ICE gathering state changed to: " + pc.iceGatheringState);
    }

    function handleICEConnectionStateChange(e) {
        console.log("*** ICE connection state changed to " + pc.iceConnectionState)
        switch (pc.iceConnectionState) {
            case "closed":
            case "failed":
            case "disconnected":
                closeVideo();
                break;
        }
    }

    function closeVideo() {
        console.log('close video ...')
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

    function handleOffer(e, rid) {
        console.log('create offer to ' + remoteID)
        remoteID = rid
        createPeerConnection()
        if (pc) {
            handlePopup(e)
            console.log('add local stream')
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    document.getElementById("local").srcObject = stream
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream)
                    })
                }, err => {
                    console.log(err)
                })
        }
    }

    function handleAnswer() {
        console.log('create answer for ', remoteID)
        console.log('sessionID: ', state)
        console.log('remoteID: ', remoteID)
        pc.createAnswer()
            .then(answer => pc.setLocalDescription(answer))
            .then(() => {
                console.log('send answer to signal server')
                ipcRenderer.send('signal', {
                    type: 'answer',
                    localID: sessionID,
                    remoteID: remoteID,
                    sdp: {
                        type: pc.localDescription.type,
                        sdp: pc.localDescription.sdp
                    }
                })
            })
            .then(() => {
                window.setOnAnswerAck(msg => {

                })
            }).then(() => {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        console.log('add answer stream')
                        document.getElementById("local").srcObject = stream
                        stream.getTracks().forEach(track => {
                            pc.addTrack(track, stream)
                        })
                    }, err => {
                        console.log(err)
                    })
            })
    }

    function handleHangup() {
        if (pc) {
            ipcRenderer.send('signal', {
                type: 'end',
                localID: state.sessionID,
                remoteID: remoteID,
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

    const initOnSignal = () => {

        // on offer
        window.setOnOffer(msg => {
            console.log('receive offer msg: ', msg)
            remoteID = msg.remoteID
            setRinging(true)
            createPeerConnection()
            let sdp = new RTCSessionDescription(msg.sdp);
            pc.setRemoteDescription(sdp)
        })

        // on answer
        window.setOnAnswer(msg => {
            console.log('receive answer msg: ', msg)
            let sdp = new RTCSessionDescription(msg.sdp);
            console.log('set remote sdp: ', sdp)
            pc.setRemoteDescription(sdp).then(() => {
                remoteID = msg.remoteID
                setRinging(true)
            })
        })

        // on candidate
        window.setOnCandidate(msg => {
            console.log("candidate msg: ", msg.candidate)
            if (pc.localDescription) {
                let candidate = new RTCIceCandidate(msg.candidate)
                console.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
                pc.addIceCandidate(candidate)
                    .then(_ => {
                        console.log('add ice candidate success')
                    }).catch((err) => {
                        console.log('add ice candidate err: ', err)
                    });
            }
        })

        // on end
        window.setOnEnd(msg => {
            console.log('receive end msg: ', msg)
            closeVideo()
            setRinging(false)
            clearRtc()
        })


    }

    function handleLogin(sid) {
        if (sid) {
            let newState = { ...state }
            newState.sessionID = sid
            newState.timeout = 30 * 60 * 1000
            setState(newState)
            sessionID = sid
        }
        initOnSignal()
    }

    function clearRtc() {

    }

    function handlePopup(e) {
        setRinging(true)
        setDirection(e.target.value)
    }

    function handleReject() {
        ipcRenderer.send('signal', {
            type: 'reject',
            localID: sessionID,
            remoteID: remoteID
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
            sessionID = ''
            timeout = 0
        }
    }


    return (
        state.sessionID && state.timeout > 0 ?
            <div className='static'>
                <LandingPage handleLogout={handleLogout} onOffer={handleOffer} sessionID={state.sessionID} />
                {
                    ringing ? (
                        <CallPopup sessionID={state.sessionID} direction={direction} onReject={handleReject} onAnswer={handleAnswer} onHangup={handleHangup} remoteID={remoteID} />
                    ) : null
                }
            </div> : <LoginPanel handleLogin={handleLogin} />
    )
}

ReactDOM.render(<MainPage />, root)
