const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')


const HOST = 'localhost:9999'
const PROTO_PATH = __dirname + '/rtc.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const RtcProto = grpc.loadPackageDefinition(pkgDef)
const RtcClient = new RtcProto.rtc.RTC(HOST, grpc.credentials.createInsecure())

module.exports = RtcClient

