import { prompt, randPassword, encryptionKeyFromMnemonic, encryptString } from "./common.mjs";
import bip39 from 'bip39'
import goodbye from 'graceful-goodbye'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'

// hyperbee
const store = new Corestore('./writer-storage')

const swarm = new Hyperswarm()
goodbye(() => swarm.destroy())
swarm.on('connection', conn => store.replicate(conn))

const core = store.get({ name: 'peerpass-core' })
const bee = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})

await core.ready()
const discovery = swarm.join(core.discoveryKey)

// main menu
var mnemonic = await prompt("Paste existing mnemonic phrase or hit ENTER to generate a new one...\n")
mnemonic = mnemonic || bip39.generateMnemonic()

if (!bip39.validateMnemonic(mnemonic)) {
  console.log('invalid mnemonic')
  process.exit()
}

var product = await prompt("What's the product or site associated with your new password?\n")
product = product || 'product'

var password = await prompt("Type a new password or hit ENTER to generate a new one...\n")
password = password || randPassword(5, 3, 2)

const encryptionKey = encryptionKeyFromMnemonic(mnemonic)
const encryptedPassword = encryptString(encryptionKey, password)

await bee.put(product, encryptedPassword)

console.log('\n')
console.log('Mnemonic:', mnemonic)
console.log('Product:', product)
console.log('Password:', password)
console.log('Encrypted password:', encryptedPassword)
console.log('Discovery key:', b4a.toString(core.key, 'hex'))