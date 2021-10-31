const RtcClient = require('./rtc/rtc')


var WebRTCDescription = {
    localID: 1,
    remoteID: 1,
    sd: {
        type: 1,
        sdp: 1
    },
    icd: {
        candidate: 1
    }
}

RtcClient.exchange(WebRTCDescription, (err, data) => {
    if (!err) {
        console.log('err:' + err)
        return
    }
    console.log(data)
})