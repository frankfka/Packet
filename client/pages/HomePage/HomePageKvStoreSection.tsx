import KeyValueStore from 'orbit-db-kvstore';
import React, { MouseEventHandler, useState } from 'react';
import { useKvStore } from '../../context/orbitDb/kvStore/kvStoreContext';
import { KvStoreParams } from '../../context/orbitDb/kvStore/kvStoreLifecycle';
import { useOrbitDb } from '../../context/orbitDb/orbitDbContext';

const KvStorePicker: React.FC = () => {
  const { setStoreParams } = useKvStore();
  const [storeAddress, setStoreAddress] = useState('');

  const createStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setStoreParams({
      address: 'test-kv-store',
      create: true,
    });
  };

  const loadStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setStoreParams({
      address: storeAddress,
      create: false,
    });
  };

  return (
    <div>
      <button onClick={createStoreClicked}>Create KV Store</button>

      <form>
        <input
          placeholder="DB Address"
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.currentTarget.value)}
        />
        <button onClick={loadStoreClicked}>Load Store</button>
      </form>
    </div>
  );
};

const KvStoreContent: React.FC<{
  store: KeyValueStore<unknown>;
  storeData: Record<string, unknown>;
  reloadStoreData(): void;
  setStoreParams(params?: KvStoreParams): void;
}> = ({ store, setStoreParams, storeData, reloadStoreData }) => {
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');

  const onSetClicked: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    await store.put(key, val);
    console.log('Put KV pair successfully', key, val);
  };

  const onUnloadStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setStoreParams(undefined);
  };

  const onReloadStoreDataClicked: MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();
    reloadStoreData();
  };

  return (
    <div>
      {/*Data Section*/}
      <div>
        <h4>Address:</h4>
        <pre>{store.address.toString()}</pre>
        <h4>Data:</h4>
        <pre>{JSON.stringify(storeData, null, 2)}</pre>
      </div>

      <div>
        {/*Add Item Section*/}
        <form>
          <input
            placeholder="Key"
            value={key}
            onChange={(e) => {
              e.preventDefault();
              setKey(e.currentTarget.value);
            }}
          />
          <input
            placeholder="Value"
            value={val}
            onChange={(e) => {
              e.preventDefault();
              setVal(e.currentTarget.value);
            }}
          />
          <button onClick={onSetClicked}>Add Item</button>
        </form>
      </div>
      <button onClick={onReloadStoreDataClicked}>Reload Store Data</button>

      <button onClick={onUnloadStoreClicked}>Unload Store</button>
    </div>
  );
};

const HomePageKvStoreSection = () => {
  const kvStoreContext = useKvStore();

  return (
    <div>
      <h3>OrbitDB Info</h3>
      {kvStoreContext.initError && <p>Initialization Error</p>}
      {!kvStoreContext.store && <KvStorePicker />}
      {kvStoreContext.store && (
        <KvStoreContent
          store={kvStoreContext.store}
          storeData={kvStoreContext.storeData ?? {}}
          setStoreParams={kvStoreContext.setStoreParams}
          reloadStoreData={kvStoreContext.reloadStoreData}
        />
      )}
    </div>
  );
};

export default HomePageKvStoreSection;
