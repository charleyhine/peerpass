import goodbye from 'graceful-goodbye'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'

const corestore = new Corestore('./temp/peer_1')

const hyperswarm = new Hyperswarm()
goodbye(() => hyperswarm.destroy())
hyperswarm.on('connection', (conn) => corestore.replicate(conn))

const hypercore1 = corestore.get({ name: 'peerpass-core' })

const bee = new Hyperbee(hypercore1, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

await hypercore1.ready()
hyperswarm.join(hypercore1.discoveryKey)

await bee.put('google', 'test_value')

// Do a single Hyperbee.get for every line of stdin data
// Each `get` will only download the blocks necessary to satisfy the query
process.stdin.setEncoding('utf-8')
process.stdin.on('data', async (data) => {
  const [key, value] = data.split(': ')
  await bee.put(key, value)

  console.log(`added ${key}: ${value}`)
})

console.log({
  // core: hypercore1,
  // coreKey: hypercore1.key,
  // coreKeyPair: hypercore1.keyPair,
  // coreDiscoveryKey: hypercore1.discoveryKey,
  charleyHexDiscoveryKey: b4a.toString(hypercore1.key, 'hex'),
})
