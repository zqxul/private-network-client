const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const { HOST } = require('../const')

const PROTO_PATH = __dirname + '/receipt.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const ReceiptProto = grpc.loadPackageDefinition(pkgDef)
const ReceiptService = new ReceiptProto.receipt.Receipt(HOST, grpc.credentials.createInsecure())


const ReceiptClient = {
    Fetch: (request, callback) => ReceiptService.Fetch(request, callback),
    Clear: (request, callback) => ReceiptService.Clear(request, callback),
}

module.exports = ReceiptClient