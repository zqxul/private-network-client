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
    // const [rtcState, setRtcState] = useState({
    //     sdp: null,
    //     ice: ''
    // })

    function createPeerConnection() {
        console.log('setup peer connection')
        // pc = new RTCPeerConnection()
        pc = new RTCPeerConnection({
            iceServers: [
                // {
                // urls: 'turn:numb.viagenie.ca',
                // urls: 'stun:stun.schlund.de',
                // credential: 'muazkh',
                // username: 'webrtc@live.com'
                // }
                {
                    urls: "turn:localhost",  // A TURN server
                    username: "webrtc",
                    credential: "turnserver"
                }
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
        log("*** Track event ***");
        document.getElementById("remote").srcObject = e.streams[0]
    }

    function handleICECandidate(e) {
        console.log('*** ice candidate ', e.candidate)
        if (e.candidate) {
            ipcRenderer.send('signal', {
                type: 'candidate',
                localID: sessionID,
                remoteID: remoteID,
                candidate: {
                    address: e.candidate.address,
                    candidate: e.candidate.candidate,
                    component: e.candidate.component,
                    foundation: e.candidate.foundation,
                    port: e.candidate.port,
                    priority: e.candidate.priority,
                    protocol: e.candidate.protocol,
                    relatedAddress: e.candidate.relatedAddress,
                    relatedPort: e.candidate.relatedPort,
                    sdpMid: e.candidate.sdpMid,
                    sdpMLineIndex: e.candidate.sdpMLineIndex,
                    tcpType: e.candidate.tcpType,
                    type: e.candidate.type,
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

    function handleOffer(e, remoteID) {
        console.log('create offer to ' + remoteID)
        remoteID = remoteID
        createPeerConnection()
        if (pc) {
            console.log('add local stream')
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    document.getElementById("video").srcObject = stream
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream)
                    })
                }, err => {
                    console.log(err)
                })
            console.log('creat offering')
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    console.log('send offer to signal server')
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
                }).then(() => {
                    window.setOnOfferAck(msg => {

                    })
                }).then(() => {
                    // on answer
                    window.setOnAnswer(msg => {
                        console.log('receive answer msg: ', msg)
                        let sdp = new RTCSessionDescription(msg.sdp);
                        console.log('set remote sdp: ', sdp)
                        pc.setRemoteDescription(sdp)
                        // console.log('set rtc state: ', rtcState)
                        remoteID = msg.remoteID
                        // setRtcState({
                        //     remoteID: msg.remoteID,
                        //     sdp: msg.sdp,
                        //     ice: msg.ice
                        // })
                        // console.log('new rtc state: ', rtcState)
                        setRinging(true)
                    })
                    // on end
                    window.setOnEnd(msg => {
                        console.log('receive end msg: ', msg)
                        closeVideo()
                        setRinging(false)
                        clearRtc()
                    })
                })
                .then(() => {
                    handlePopup(e)
                })
        }
    }

    const handleAnswer = () => {
        console.log('create answer for ', remoteID)
        console.log('sessionID: ', state)
        console.log('remoteID: ', remoteID)
        // if (rtcState.sdp) {
        // createPeerConnection()
        // let sdp = new RTCSessionDescription(rtcState.sdp);
        // pc.setRemoteDescription(sdp)
        // navigator.mediaDevices.getUserMedia({ video: true })
        //     .then(stream => {
        //         console.log('add answer stream')
        //         document.getElementById("video").srcObject = stream
        //         stream.getTracks().forEach(track => {
        //             pc.addTrack(track, stream)
        //         })
        //     }, err => {
        //         console.log(err)
        //     })
        // .then(() => pc.createAnswer())
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
                // on end
                window.setOnEnd(msg => {
                    console.log('receive end msg: ', msg)
                    closeVideo()
                    setRinging(false)
                    clearRtc()
                })
            })
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

    const initOnSignal = () => {
        // on candidate
        window.setOnCandidate(msg => {
            let candidate = new RTCIceCandidate(msg.candidate)
            console.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
            pc.addIceCandidate(candidate)
                .then(_ => {
                    console.log('add ice candidate success')
                }).catch((err) => {
                    console.log('add ice candidate err: ', err)
                });
        })

        // on offer
        window.setOnOffer(msg => {
            console.log('receive offer msg: ', msg)
            remoteID = msg.remoteID
            // setRtcState({
            //     remoteID: msg.remoteID,
            //     sdp: msg.sdp,
            //     ice: msg.ice
            // })
            createPeerConnection()
            let sdp = new RTCSessionDescription(msg.sdp);
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
            setRinging(true)
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
        console.log('clear rtc ', rtcState)
        // setRtcState({
        //     remoteID: '',
        //     sdp: null,
        //     ice: null
        // })
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
