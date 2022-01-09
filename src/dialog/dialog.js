const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')


const HOST = 'localhost:3009'
const PROTO_PATH = __dirname + '/dialog.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const DialogProto = grpc.loadPackageDefinition(pkgDef)
const DialogService = new DialogProto.dialog.Dialog(HOST, grpc.credentials.createInsecure())


const DialogClient = {
    Create: (request, callback) => DialogService.Create(request, callback),
    List: (request, callback) => DialogService.List(request, callback)
}

module.exports = DialogClient