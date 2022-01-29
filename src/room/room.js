const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const { HOST } = require('../const')

const PROTO_PATH = __dirname + '/room.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const RoomProto = grpc.loadPackageDefinition(pkgDef)
const RoomService = new RoomProto.room.Room(HOST, grpc.credentials.createInsecure())


const RoomClient = {
    List: (request, callback) => RoomService.List(request, callback),
    New: (request, callback) => RoomService.New(request, callback),
    Close: (request, callback) => RoomService.Close(request, callback),
    Enter: (request, callback) => RoomService.Enter(request, callback),
    Exit: (request, callback) => RoomService.Exit(request, callback),
}

module.exports = RoomClient