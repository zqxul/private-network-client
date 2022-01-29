const grpc = require('@grpc/grpc-js')
const loader = require('@grpc/proto-loader')
const { HOST } = require('../const')

const PROTO_PATH = __dirname + '/auth.proto';
const pkgDef = loader.loadSync(PROTO_PATH)
const AuthProto = grpc.loadPackageDefinition(pkgDef)
const AuthService = new AuthProto.auth.Auth(HOST, grpc.credentials.createInsecure())


const AuthClient = {
    Captcha: (request, callback) => AuthService.Captcha(request, callback),
    Login: (request, callback) => AuthService.Login(request, callback),
    Logout: (request, callback) => AuthService.Logout(request, callback),
    Register: (request, callback) => AuthService.Register(request, callback)
}

module.exports = AuthClient