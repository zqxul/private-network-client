
// quic test
const Client = require('quic').Client
const encode = require('@msgpack/msgpack').encode
let client = new Client()
client.on('error', err => {
    console.log('connect err:', err)
})
client.connect(3010, '192.168.199.197')
    .then(() => {
        const stream = client.request()

        let status = stream.write(encode({
            st: 'live',
            localID: '1111',
        }), err => {
            if (err) {
                console.log('write err:', err)
            }
        })
        console.log('write status: ', status)
    }).catch(e => {
        console.log('connect err:', e)
    })
