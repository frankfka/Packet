/*
Packet Registry Feed Details Page
 */
import { useRouter } from 'next/router';

export default function RegistryFeedDetails() {
  const router = useRouter();
  const { feedName } = router.query;

  return <div>{feedName}</div>;
}
