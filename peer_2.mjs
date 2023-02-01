import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import goodbye from 'graceful-goodbye'
import b4a from 'b4a'
import { Node } from 'hyperbee/lib/messages.js'

const charleyHexDiscoveryKey = 'a03d71c5a85dfe7fd4c6d810b5f1f28884acc62685784ad3dad626ee558db71c'

// create a corestore instance with the given location
const corestore = new Corestore('./reader-storage')

const hyperswarm = new Hyperswarm()
goodbye(() => hyperswarm.destroy())

// replication of the corestore instance on connection with other peers
hyperswarm.on('connection', (conn) => corestore.replicate(conn))

// creation of Hypercore instance (if not already created)
const hypercore = corestore.get({ key: b4a.from(charleyHexDiscoveryKey, 'hex') })
await hypercore.ready()

// handshake with peers, but don't wait
const foundPeers = corestore.findingPeers()
hyperswarm.join(hypercore.discoveryKey)
hyperswarm.flush().then(() => foundPeers())

// update the meta-data information of the hypercore instance
await hypercore.update()

const hyperbee = new Hyperbee(hypercore, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

const logReadStream = async () => {
  const db = {}
  for await (const { key, value } of hyperbee.createReadStream()) {
    db[key?.trim()] = value?.trim()
  }
  console.log({ db })
}

let version = hyperbee.version
console.log(hyperbee.version)
setInterval(() => {
  if (hyperbee.version > version) {
    console.log(hyperbee.version)
    version = hyperbee.version

    logReadStream()

    // const snapshot = hyperbee.snapshot()
    // console.log({ snapshot })
  }
}, 500)

// process.stdin.setEncoding('utf-8')
// process.stdin.on('data', async (data) => {
//   // const dynamic = await bee.get('dynamic')

//   // console.log({ dynamic })

//   const seq = hypercore1.length - 1
//   const lastBlock = await hypercore1.get(hypercore1.length - 1)
//   const { index, key, value } = Node.decode(lastBlock)
//   const dIndex = Node.decode(index)
//   // const dKey = Node.decode(key)
//   // const dValue = Node.decode(value)

//   // ​
//   // // print the information about the last block or the latest block of the hypercore instance
//   console.log({
//     seq,
//     index,
//     key,
//     value,
//     dIndex,
//     // dKey,
//     // dValue,
//   })
// })
