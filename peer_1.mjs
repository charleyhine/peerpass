import goodbye from "graceful-goodbye";
import Hyperswarm from "hyperswarm";
import Corestore from "corestore";
import Hyperbee from "hyperbee";
import b4a from "b4a";

const corestore = new Corestore("./writer-storage");

const hyperswarm = new Hyperswarm();
goodbye(() => hyperswarm.destroy());
hyperswarm.on("connection", (conn) => corestore.replicate(conn));

const hypercore1 = corestore.get({ name: "peerpass-core" });
const bee = new Hyperbee(hypercore1, {
  keyEncoding: "utf-8",
  valueEncoding: "utf-8",
});

await hypercore1.ready();
hyperswarm.join(hypercore1.discoveryKey);

await bee.put("google", "test_value");

console.log({
  // core: hypercore1,
  // coreKey: hypercore1.key,
  // coreKeyPair: hypercore1.keyPair,
  // coreDiscoveryKey: hypercore1.discoveryKey,
  charleyHexDiscoveryKey: b4a.toString(hypercore1.key, "hex"),
});
