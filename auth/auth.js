const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')


const HOST = 'localhost:3009'
const PROTO_PATH = __dirname + '/auth.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const AuthProto = grpc.loadPackageDefinition(pkgDef)
const AuthClient = new AuthProto.auth.Auth(HOST, grpc.credentials.createInsecure())

module.exports = AuthClient