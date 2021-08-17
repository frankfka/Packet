import { useRouter } from 'next/router';
import React from 'react';
import IntakeViewerPage from '../../client/pages/intake/viewer/IntakeViewerPage';
import enforceStringForRouterQuery from '../../client/util/enforceStringForRouterQuery';

/*
Viewer Page for Packet Intake
 */
export default function IntakePostViewer() {
  const router = useRouter();
  const { postHash, feedRootAddress } = router.query;

  return (
    <IntakeViewerPage
      postHash={enforceStringForRouterQuery(postHash)}
      feedRootAddress={enforceStringForRouterQuery(feedRootAddress)}
    />
  );
}
