import { useRouter } from 'next/router';

/*
Packet Registry Feed Post Viewer Page
 */
export default function RegistryFeedPostViewer() {
  const router = useRouter();
  const { postHash } = router.query;

  return <div>{postHash}</div>;
}
