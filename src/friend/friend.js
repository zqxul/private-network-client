const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const { HOST } = require('../const')

const PROTO_PATH = __dirname + '/friend.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const FriendProto = grpc.loadPackageDefinition(pkgDef)
const FriendService = new FriendProto.friend.Friend(HOST, grpc.credentials.createInsecure())


const FriendClient = {
    Apply: (request, callback) => FriendService.Apply(request, callback),
    ApplyList: (request, callback) => FriendService.ApplyList(request, callback),
    UnFriend: (request, callback) => FriendService.UnFriend(request, callback),
    Review: (request, callback) => FriendService.Review(request, callback)
}

module.exports = FriendClient