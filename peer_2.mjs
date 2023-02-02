import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import goodbye from 'graceful-goodbye'
import b4a from 'b4a'

const charleyHexDiscoveryKey = '9dd05e8210a71cd195e349c5c0fcbf4d68ec96b5596474c6b3767ba4db3f64e2'

// Corestore is a Hypercore factory
// create a corestore instance with the given location
const corestore = new Corestore('./temp/peer_2')

// Hyperswarm allows you to find and connect to peers announcing a common 'topic'
const hyperswarm = new Hyperswarm()
goodbye(() => hyperswarm.destroy())

// Emitted whenever the swarm connects to a new peer
// Replication of the corestore instance on connection with other peers
hyperswarm.on('connection', (conn) => corestore.replicate(conn))

// Hypercore is a secure, distributed append-only log built for sharing large datasets and streams of real-time data.
// Loads a Hypercore, either by name (if the name option is provided),
// or from the provided key (if the first argument is a Buffer, or if the key option is set).
const hypercore = corestore.get({ key: b4a.from(charleyHexDiscoveryKey, 'hex') })
await hypercore.ready()

// flush() will wait until *all* discoverable peers have been connected to
// It might take a while, so don't await it
// Instead, use core.findingPeers() to mark when the discovery process is completed
hyperswarm.join(hypercore.discoveryKey)
hyperswarm.flush().then(() => corestore.findingPeers())

// Wait for the core to try and find a signed update to its length
// Does not download any data from peers except for proof of the new core length
await hypercore.update()

// Hyperbee is an append-only B-tree based on Hypercore
const hyperbee = new Hyperbee(hypercore, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

let version = 0
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

async function logReadStream() {
  const db = {}
  for await (const { key, value } of hyperbee.createReadStream()) {
    db[key?.trim()] = value?.trim()
  }
  console.log({ db })
}
