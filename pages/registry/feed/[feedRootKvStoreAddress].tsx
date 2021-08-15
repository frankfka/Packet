import { useRouter } from 'next/router';
import RegistryFeedPage from '../../../client/pages/registry/feed/RegistryFeedPage';

/*
Packet Registry Feed Details Page
 */
export default function RegistryFeedDetails() {
  const router = useRouter();
  const { feedRootKvStoreAddress } = router.query;

  return (
    <RegistryFeedPage
      feedRootKvStoreAddress={
        typeof feedRootKvStoreAddress === 'string' ? feedRootKvStoreAddress : ''
      }
    />
  );
}
