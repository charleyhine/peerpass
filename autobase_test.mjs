import goodbye from 'graceful-goodbye'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Autobase from 'autobase'
import Autobee from './autobee-simple.js'
import { Node } from 'hyperbee/lib/messages.js'

// DESKTOP
const corestore1 = new Corestore('./temp/desktop-storage')
const hypercore1 = corestore1.get({ name: 'pearpass-1' })
const hyperbee1 = new Hyperbee(hypercore1, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

// MOBILE
const corestore2 = new Corestore('./temp/mobile-storage')
const hypercore2 = corestore2.get({ name: 'pearpass-2' })
const hyperbee2 = new Hyperbee(hypercore2, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

// // LOCAL
// const corestore3 = new Corestore('./temp/local-storage')
// const hypercore3 = corestore3.get({ name: 'pearpass' })
// const hyperbee3 = new Hyperbee(hypercore3, {
//   keyEncoding: 'utf-8',
//   valueEncoding: 'utf-8',
// })

const autobase = new Autobase({
  inputs: [hypercore1],
  localInput: hypercore1,
})

const autobee = new Autobee(autobase, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

await autobase.addInput(hypercore2)

await autobee.put('test_key', 'test_value')
await autobee.put('test_key2', 'test_value2')
await autobee.put('test_key3', 'bangs')

const storedEntry = await autobee.get('test_key3')
console.log({ storedEntry })
