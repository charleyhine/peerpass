import goodbye from 'graceful-goodbye'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Autobase from 'autobase'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'

const conns = []
const remoteCores = []

const vaultTopic = b4a.from(
  '5f6101b77326a81705d662ad445f8ea6146ade0a553c31ef8d4d51fff7ca891c',
  'hex',
)

//const vaultTopic = process.argv[2] ? b4a.from(process.argv[2], 'hex') : crypto.randomBytes(32)
const readableVaultTopic = b4a.toString(vaultTopic, 'hex')

const dataFolder = process.argv[2] ? 'device_2' : 'device_1'
const corestore = new Corestore(`./temp/${dataFolder}`)

const swarm = new Hyperswarm()
goodbye(() => swarm.destroy())

swarm.on('connection', (conn) => {
  processNewConnection(conn)
  return corestore.replicate(conn)
})

const hypercore = corestore.get({ name: 'vault-hypercore' })
await hypercore.ready()
const hypercoreDiscoveryKey = b4a.toString(hypercore.key, 'hex')
console.log({ hypercoreDiscoveryKey })

const hyperbee = new Hyperbee(hypercore, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

const foundPeers = corestore.findingPeers()
const discovery = swarm.join(vaultTopic)
swarm.flush().then(() => foundPeers())

logHyperbee('local', hyperbee)

////////////////
// CONNECTION //
////////////////

async function processNewConnection(conn) {
  console.log('* new connection from:', b4a.toString(conn.remotePublicKey, 'hex'), '*')

  conns.push(conn)
  conn.once('close', () => conns.splice(conns.indexOf(conn), 1))
  conn.on('data', (data) => processConnectionMessage(data))

  // send hypercore discovery key
  conn.write(JSON.stringify({ remoteHypercoreKey: hypercoreDiscoveryKey }))
}

async function processConnectionMessage(data) {
  if (!isJsonString(data)) return
  let json = JSON.parse(data)
  if (!json.remoteHypercoreKey) return
  console.log(`received: ${json}`)

  // receive hypercore discovery key
  let remoteHypercore = corestore.get({ key: b4a.from(json.remoteHypercoreKey, 'hex') })
  remoteCores.push(remoteHypercore)
  await remoteHypercore.ready()

  swarm.join(remoteHypercore.discoveryKey)
  await remoteHypercore.update()

  // Hyperbee is an append-only B-tree based on Hypercore
  const remoteHyperbee = new Hyperbee(remoteHypercore, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8',
  })

  logHyperbee('remote', remoteHyperbee)
}

discovery.flushed().then(() => {
  console.log('joined vault topic:', readableVaultTopic)
  console.log(`node peer.mjs ${readableVaultTopic}`)
})

//////////////
// HYPERBEE //
//////////////

function logHyperbee(name, bee) {
  let version = 0
  console.log(bee.version)
  setInterval(() => {
    if (bee.version > version) {
      console.log(bee.version)
      version = bee.version

      logReadStream()
    }
  }, 500)

  async function logReadStream() {
    const db = {}
    for await (const { key, value } of bee.createReadStream()) {
      db[key?.trim()] = value?.trim()
    }
    console.log({ name: name, hyperbee: db })
  }
}

process.stdin.setEncoding('utf-8')
process.stdin.on('data', async (data) => {
  const [key, value] = data.split(': ')
  await hyperbee.put(key, value)
  console.log(`added ${key}: ${value}`)
})

function isJsonString(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
