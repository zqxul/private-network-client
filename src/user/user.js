const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const HOST = require('../const')

const PROTO_PATH = __dirname + '/user.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const UserProto = grpc.loadPackageDefinition(pkgDef)
const UserService = new UserProto.user.User(HOST, grpc.credentials.createInsecure())


const UserClient = {
    List: (request, callback) => UserService.List(request, callback),
    ConversationList: (request, callback) => UserService.ConversationList(request, callback),
    AddrBook: (request, callback) => UserService.AddrBook(request, callback),
    Detail: (request, callback) => UserService.Detail(request, callback),
    BriefInfos: (request, callback) => UserService.BriefInfos(request, callback),
}

module.exports = UserClient