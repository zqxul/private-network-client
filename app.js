const RtcClient = require('./rtc/rtc')
const AuthClient = require('./auth/auth')

var LoginRequest = {
    username: 1
}

AuthClient.Login(LoginRequest, (err, data) => {
    if (err) {
        console.log('' + err)
        return
    }
    console.log(data)
})

// var WebRTCDescription = {
//     localID: 1,
//     remoteID: 1,
//     sd: {
//         type: 1,
//         sdp: 1
//     },
//     icd: {
//         candidate: 1
//     }
// }

// RtcClient.exchange(WebRTCDescription, (err, data) => {
//     if (!err) {
//         console.log('err:' + err)
//         return
//     }
//     console.log(data)
// })