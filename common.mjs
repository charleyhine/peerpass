import bip39 from 'bip39'
import crypto from 'crypto'
import readline from 'readline'

export function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

export function randPassword(letters, numbers, either) {
  var chars = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", // letters
    "0123456789", // numbers
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // either
  ];

  function randInt(this_max) { // return int between 0 and this_max - 1
    let umax = Math.pow(2, 32);
    let max = umax - (umax % this_max);
    let r = new Uint32Array(1);
    do {
      crypto.randomFillSync(r);
    } while (r[0] > max);
    return r[0] % this_max;
  }

  function randCharFrom(chars) {
    return chars[randInt(chars.length)];
  }

  function shuffle(arr) { // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
    for (let i = 0, n = arr.length; i < n - 2; i++) {
      let j = randInt(n - i);
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  }

  return shuffle([letters, numbers, either].map(function (len, i) {
    return Array(len).fill(chars[i]).map(x => randCharFrom(x)).join('');
  }).concat().join('').split('')).join('')
}

export function encryptionKeyFromMnemonic(mnemonic) {
  var seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
  return crypto.scryptSync(seed, "salt", 24)
}

export function encryptString(key, clearText) {
  const algorithm = "aes-192-cbc"
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(clearText, "utf8", "hex");
  return [
    encrypted + cipher.final("hex"),
    Buffer.from(iv).toString("hex"),
  ].join("|");
}

export function decryptString(key, encryptedText) {
  const algorithm = "aes-192-cbc"
  const [encrypted, iv] = encryptedText.split("|");
  if (!iv) throw new Error("IV not found");
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}