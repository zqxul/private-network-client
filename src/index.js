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
        localID: '',
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

    function handleSelected(selectedID) {
        remoteID = selectedID
    }

    function handleVideoCallOut() {
        console.log('create video offer to ' + remoteID)
        createPeerConnection()
        if (pc) {
            handlePopup('out')
            console.log('add local stream')
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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

    function handleVoiceCallOut() {
        console.log('create voice offer to ' + remoteID)
        createPeerConnection()
        if (pc) {
            handlePopup('out')
            console.log('add local stream')
            navigator.mediaDevices.getUserMedia({ audio: true })
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
                closeVideo()
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

        // on message
        // remote message
        window.setOnBackgroundMessage(data => {
            console.log('receive background message: ', data)
            let message = {
                msgID: data.message.msgID,
                type: data.message.type,
                body: data.message.body,
                timestamp: data.message.timestamp,
                fromID: data.remoteID,
                toID: data.localID,
                remoteID: data.remoteID,
                sourceID: data.remoteID,
                remoteread: data.remoteID + '::0',
            }
            window.SaveMessages(data.localID, [message])
        })
        // local message ack
        window.setOnBackgroundMessageAck(data => {
            console.log('receive background message ack: ', data)
            if (data.remoteID && data.message) {
                let message = {
                    msgID: data.message.msgID,
                    type: data.message.type,
                    body: data.message.body,
                    timestamp: data.message.timestamp,
                    fromID: data.localID,
                    toID: data.remoteID,
                    remoteID: data.remoteID,
                    sourceID: data.localID,
                    remoteread: data.remoteID + '::0',
                }
                window.SaveMessages(data.localID, [message])
            }
        })
        // update remoteread
        window.setOnBackgroundReceipt(data => {
            if (data && data.receipt) {
                window.SetRemoteRead(data.receipt.msgID)
                // clear message
            }
        })
        window.setOnBackgroundReceiptAck(data => {
            if (data && data.receipt) {
                window.SetRemoteRead(data.receipt.msgID)
            }
        })
    }

    function fetchMessage(sid) {
        let timestamp = 0
        let result = ipcRenderer.sendSync('fetchMsg', {
            sessionID: sid,
            timestamp: timestamp,
            limit: 20
        })
        if (result && result.networkID) {
            if (result.messages && result.messages.length > 0) {
                let last = result.messages[result.messages.length - 1]
                timestamp = last.timestamp
                let storeMsgs = result.messages.map(message => {
                    message.remoteID = message.fromID
                    message.sourceID = message.fromID
                    message.remoteread = message.fromID + '::0'
                    return message
                })
                window.SaveMessages(result.networkID, storeMsgs)
                //TODO after save message success, clear the message in server message cache
            }
        }
    }

    function fetchReceipt(sid) {
        let timestamp = 0
        let result = ipcRenderer.sendSync('fetchReceipt', {
            sessionID: sid,
            timestamp: timestamp,
            limit: 20
        })
        if (result && result.userID) {
            if (result.receipts && result.receipts.length > 0) {
                let last = result.receipts[result.receipts.length - 1]
                timestamp = last.timestamp
                result.receipts.map(receipt => {
                    window.SetRemoteRead(receipt.msgID)
                })
            }
        }
    }

    function handleLogin(result) {
        if (result) {
            let newState = { ...state }
            newState.sessionID = result.sessionID
            newState.localID = result.networkID
            newState.timeout = 30 * 60 * 1000
            setState(newState)
            sessionID = result.sessionID
        }

        fetchMessage(result.sessionID)
        fetchReceipt(result.sessionID)
        initOnSignal()
    }

    function clearRtc() {

    }

    function handlePopup(direction) {
        setRinging(true)
        setDirection(direction)
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
                <LandingPage handleLogout={handleLogout} handleVideoCallOut={handleVideoCallOut} handleVoiceCallOut={handleVoiceCallOut} sessionID={state.sessionID} localID={state.localID} onSelected={handleSelected} />
                {
                    ringing ? (
                        <CallPopup sessionID={state.sessionID} direction={direction} onReject={handleReject} onAnswer={handleAnswer} onHangup={handleHangup} remoteID={remoteID} />
                    ) : null
                }
            </div> : <LoginPanel handleLogin={handleLogin} />
    )
}

ReactDOM.render(<MainPage />, root)
