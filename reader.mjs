import { prompt, encryptionKeyFromMnemonic, decryptString } from "./common.mjs";
import bip39 from 'bip39'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import goodbye from 'graceful-goodbye'
import b4a from 'b4a'

// hyperbee
const store = new Corestore('./reader-storage')

const swarm = new Hyperswarm()
goodbye(() => swarm.destroy())
swarm.on('connection', conn => store.replicate(conn))

const core = store.get({ key: b4a.from(process.argv[2], 'hex') })
const bee = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})

await core.ready()
swarm.join(core.discoveryKey)

// main menu
const mnemonic = await prompt("Paste existing mnemonic phrase...\n")
if (!bip39.validateMnemonic(mnemonic)) {
  console.log('invalid mnemonic')
  process.exit()
}

const product = await prompt("What's the product or site you'd like the password for?\n")

const beePair = await bee.get(product)
const encryptedPassword = beePair.value

const encryptionKey = encryptionKeyFromMnemonic(mnemonic)
const decryptedPassword = decryptString(encryptionKey, encryptedPassword)

console.log('\n')
console.log('Mnemonic:', mnemonic)
console.log('Product:', product)
console.log('Encrypted password:', encryptedPassword)
console.log('Decrypted password:', decryptedPassword)