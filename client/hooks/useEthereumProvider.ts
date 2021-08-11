// TODO: https://github.com/MetaMask/providers
// https://docs.metamask.io/guide/ethereum-provider.html#methods
// https://ethereum.org/en/developers/docs/apis/javascript/
async function onInit() {
  await window.ethereum.enable();
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const account = accounts[0];
  console.log(account);
  window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    console.log(accounts[0]);
  });
}
