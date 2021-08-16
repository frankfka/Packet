type IPFSConfig = Record<string, any>;

const ipfsConfig: IPFSConfig = {
  start: true,
  relay: {
    enabled: false, // enable relay dialer/listener (STOP)
    hop: {
      enabled: false, // make this node a relay (HOP)
    },
  },
  preload: {
    enabled: false,
  },
  repo: './packet-ipfs',
  pubsub: true,
  config: {
    Addresses: {
      Swarm: [
        // Use IPFS/LibP2P dev signal servers
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
      ],
    },
  },
};

export default ipfsConfig;
