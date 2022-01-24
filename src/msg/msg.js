const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const HOST = require('../const')

const PROTO_PATH = __dirname + '/msg.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const MsgProto = grpc.loadPackageDefinition(pkgDef)
const MsgService = new MsgProto.msg.Msg(HOST, grpc.credentials.createInsecure())


const MsgClient = {
    Fetch: (request, callback) => MsgService.Fetch(request, callback),
    Clear: (request, callback) => MsgService.Clear(request, callback),
}

module.exports = MsgClient