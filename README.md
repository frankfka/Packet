# Packet Demo App

Packet is a web3-enabled content distribution ecosystem built to replace email. It leverages a decentralized database
built on top of [OrbitDB](https://orbitdb.org/) and authentication enabled by Ethereum wallets. The Packet protocol
enables **publishers** to have ownership over their

Packet is a content distribution protocol and ecosystem built on top of Ethereum and IPFS. It enables **publishers** to
have ownership over their own content and **readers** to easily subscribe to published feeds within a focused medium for
content consumption. Further details can be found in
the [LitePaper](https://bafybeie2vnv6irxxfok7r2wk32n33lfelbueylh5wehdtxqfqbci6zolya.ipfs.dweb.link/Packet_LitePaper.pdf)
.

## Getting Started

Running the app is as easy as installing all the dependencies (`yarn` or `npm install`) and running the `dev` script. To
use browser-to-browser communication, we use publically
available [signaling servers](https://github.com/libp2p/js-libp2p-webrtc-star). However, these can be slow to connect
peers (in a production environment, we would have our own dedicated signalling server). To have a faster experience in a
local environment, you can run a local signalling server:

First, install the CLI client:

```bash
npm install --global libp2p-webrtc-star
```

Then, in 2 separate processes, run the `run_local_swarm` npm script (which starts the local signalling server),
and `dev_local_swarm` script (which starts the Next.js app with an environment variable to switch on the usage of local
signalling servers).

## The Demo App

The demo application is a **fully-decentralized** implementation of Packet. We leverage [OrbitDB](https://orbitdb.org/),
a distributed P2P database built on IPFS, for the storage and distribution of content. The demo application has
implementations for both Packet Registry (the publishing dashboard) and Packet Intake (the web reader app). We
experimented with an initial version of the Packet protocol, whereby the schema for a single `Feed` is as follows:

**The Feed “Metadata” [Key Value Store](https://github.com/orbitdb/orbit-db-kvstore) - This contains metadata on the
feed itself**

```json
{
  "name": "Name of the feed",
  "iconUri": "Optional URI to an icon asset",
  "postsDbAddress": "Full OrbitDB address of the posts databases"
}
```

**The Posts [FeedStore](https://github.com/orbitdb/orbit-db-feedstore) - This contains a feed-log of all the published
posts, each having:**

```json
{
  "title": "Title of the post",
  "content": "String content of the post",
  "createdAt": "ISO date of creation"
}
```

In the future, we can extend support for different content types by allowing an object value for the content field:

```json
{
  "type": "Type of the content - likely an enum, such as TEXT/URI/MARKDOWN - similar to mime types",
  "value": "The appropriate value given type - for example, if type: URI, then value: some_url_or_cid"
}
```

To enable access control on feeds, such as only the publisher has write access, we utilize
OrbitDB [identities](https://github.com/orbitdb/orbit-db/blob/main/GUIDE.md#identity) and access control with Ethereum
accounts. Currently, **a web3 wallet (ex. Metamask)** is required to grant publisher-only write access to created feeds.
This is so that we can use Ethereum-based authentication to prevent public writes. In the future, we can extend this
functionality by enabling support for decentralized identifiers ([DID](https://www.w3.org/TR/did-core/)) and other
identification methods.

The OrbitDB instance is backed by a browser-based IPFS node. For browser-to-browser communication to occur, we leverage
a signalling server enabled by `libp2p-webrtc-star` (a
libp2p [package](https://github.com/libp2p/js-libp2p-webrtc-star)) either hosted locally or by Protocol Labs. We also
needed to enable pubsub for IPFS to work across browsers. The web-app itself is a Next.js project, though the
client-only nature of a distributed app means that we do not need to leverage much of the server-side functionality that
Next.js offers.

### Opportunities for Further Implementation

We have a few additional opportunities to leverage the power of IPFS and OrbitDB. Namely:

* Pinning data on persistent nodes as opposed to relying on brower-to-browser replication, which can be slow
* Additional integration with identity providers
* Enabling automatic backups & pinning of OrbitDB data
