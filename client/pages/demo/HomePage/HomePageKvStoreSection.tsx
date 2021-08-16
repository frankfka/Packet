import KeyValueStore from 'orbit-db-kvstore';
import React, { MouseEventHandler, useState } from 'react';
import { useOrbitDbKvStore } from '../../../context/orbitDb/kvStore/useOrbitDbKvStore';
import {
  GetKvStoreParams,
  OrbitKvStoreData,
} from '../../../util/orbitDb/orbitDbKvStoreUtils';

const KvStorePicker: React.FC<{
  setStoreParams(p: GetKvStoreParams): void;
}> = ({ setStoreParams }) => {
  const [storeAddress, setStoreAddress] = useState('');

  const createStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setStoreParams({
      addressOrName: 'test-kv-store',
      createParams: {
        accessController: {
          write: ['*'],
        },
      },
    });
  };

  const loadStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setStoreParams({
      addressOrName: storeAddress,
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
  storeData: OrbitKvStoreData<unknown>;
  reloadStoreData(): void;
  unloadStore(): void;
}> = ({ store, storeData, reloadStoreData, unloadStore }) => {
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');

  const onSetClicked: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    await store.put(key, val);
    console.log('Put KV pair successfully', key, val);
  };

  const onUnloadStoreClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    unloadStore();
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
  const [storeParams, setStoreParams] = useState<GetKvStoreParams | undefined>({
    addressOrName: 'test-orbitdb-kv',
  });

  const kvStore = useOrbitDbKvStore(storeParams);

  const unloadStore = () => {
    setStoreParams(undefined);
  };

  return (
    <div>
      <h3>OrbitDB Info</h3>
      {kvStore.initError && <p>Initialization Error</p>}
      {!kvStore.store && <KvStorePicker setStoreParams={setStoreParams} />}
      {kvStore.store && (
        <KvStoreContent
          store={kvStore.store}
          storeData={kvStore.storeData ?? {}}
          reloadStoreData={kvStore.reloadStoreData}
          unloadStore={unloadStore}
        />
      )}
    </div>
  );
};

export default HomePageKvStoreSection;
