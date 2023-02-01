import Hyperswarm from "hyperswarm";
import Corestore from "corestore";
import Hyperbee from "hyperbee";
import goodbye from "graceful-goodbye";
import b4a from "b4a";

// hyperbee
const store = new Corestore("./reader-storage");

const swarm = new Hyperswarm();
goodbye(() => swarm.destroy());
swarm.on("connection", (conn) => store.replicate(conn));

const hypercore1 = store.get({ key: b4a.from(process.argv[2], "hex") });
const bee = new Hyperbee(hypercore1, {
  keyEncoding: "utf-8",
  valueEncoding: "utf-8",
});

await hypercore1.ready();
swarm.join(hypercore1.discoveryKey);

const resp = await bee.get("test_key");

console.log({
  // resp,
  // core: hypercore1,
  // coreKey: hypercore1.key,
  // coreKeyPair: hypercore1.keyPair,
  // coreDiscoveryKey: hypercore1.discoveryKey,
  charleyHexDiscoveryKey: b4a.toString(hypercore1.key, "hex"),
});
