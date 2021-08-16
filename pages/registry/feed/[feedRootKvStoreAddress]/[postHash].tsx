import { useRouter } from 'next/router';
import RegistryFeedPostViewerPage from '../../../../client/pages/registry/feed/feedPostViewerPage/RegistryFeedPostViewerPage';
import enforceStringForRouterQuery from '../../../../client/util/enforceStringForRouterQuery';

/*
Packet Registry Feed Post Viewer Page
 */
export default function RegistryFeedPostViewer() {
  const router = useRouter();
  const { postHash, feedRootKvStoreAddress } = router.query;

  return (
    <RegistryFeedPostViewerPage
      feedRootKvStoreAddress={enforceStringForRouterQuery(
        feedRootKvStoreAddress
      )}
      postHash={enforceStringForRouterQuery(postHash)}
    />
  );
}
