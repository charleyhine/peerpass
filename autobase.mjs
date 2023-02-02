import goodbye from 'graceful-goodbye'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Autobase from 'autobase'
import Autobee from './autobee-simple.js'
import { Node } from 'hyperbee/lib/messages.js'

// DESKTOP
const corestore1 = new Corestore('./temp/desktop-storage')
const hypercore1 = corestore1.get({ name: 'pearpass' })
const hyperbee1 = new Hyperbee(hypercore1, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

// MOBILE
const corestore2 = new Corestore('./temp/mobile-storage')
const hypercore2 = corestore2.get({ name: 'pearpass' })
const hyperbee2 = new Hyperbee(hypercore2, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

// LOCAL
const corestore3 = new Corestore('./temp/local-storage')
const hypercore3 = corestore3.get({ name: 'pearpass' })
const hyperbee3 = new Hyperbee(hypercore3, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8',
})

const autobase = new Autobase({
  inputs: [hypercore1, hypercore2, hypercore3],
  localInput: hypercore3,
  localOutput: hypercore3,
})

const autobee = new Autobee(autobase)

await autobee.put('test_key', 'test_value')

// const storedEntry = await autobee.get('test_key')
// console.log({ storedEntry })

// IDEAL PROOF OF CONCEPT
// 1. user opens desktop app and adds new password_1
// 2. user opens phone, phone can read and download password_1
// 3. user closes desktop connection, phone can access password_1
// 4. user adds password_2 to the phone
// 5. user adds password_2 to the desktop (offline)
// 6. user desktop goes online
// 7. user can access latest password_2 (created on Desktop) from their phone
