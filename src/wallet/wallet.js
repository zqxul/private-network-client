const xrpl = require('xrpl')

async function main() {
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()

    const wallet = new xrpl.Wallet()
    console.log(wallet.address) // Example: rGCkuB7PBr5tNy68tPEABEtcdno4hE6Y7f
    console.log(wallet.seed)

    // const response = await client.request({
    //     command: 'account_info',
    //     account: test_wallet.address,
    //     ledger_index: 'validated'
    // })
    // console.log('account info: ', response)
    client.fundWallet()

    client.disconnect()

}

main()