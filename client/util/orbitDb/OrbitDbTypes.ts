export type OrbitDbAddress = {
  root: string;
  path: string;
  toString(): string;
};

export type OrbitDbStoreType = TStoreType;

// Listeners
export type OrbitDbStoreListeners = {
  replicate?(address: OrbitDbAddress): void;
  replicated?(address: OrbitDbAddress): void;
  write?(address: OrbitDbAddress, entry: any): void;
  peer?(peer: OrbitDbAddress): void;
};

// Init types
export type GetOrbitDbStoreParams = {
  addressOrName: string;
  type: OrbitDbStoreType;
  createParams?: OrbitDbCreateStoreParams;
};

export type OrbitDbCreateStoreParams = {
  accessController?: ICreateOptions['accessController'];
};

// Data types
export type OrbitKvStoreData<TValueType> = Record<string, TValueType>;

export type OrbitFeedDocsKeyedByHash<TDocType> = Record<string, TDocType>;
