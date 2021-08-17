import { pull } from 'lodash';
import { useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import {
  getIntakeCurrentUserData,
  IntakeUser,
  setIntakeCurrentUserData,
} from '../../util/localStorage/intakeCurrentUser';

const logger = getLogger('UseIntakeUser');

export type UseIntakeUserState = {
  // User State
  isLoadingUser: boolean;
  user?: IntakeUser;
  // Exposed functions
  addSubscription(feedAddress: string): void;
  removeSubscription(feedAddress: string): void;
};

// Util hook for Intake user data
const useIntakeUserUtils = (): UseIntakeUserState => {
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Start in loading
  const [userData, setUserData] = useState<IntakeUser>();

  // Initialize user on load
  useEffect(() => {
    setUserData(getIntakeCurrentUserData());
    setIsLoadingUser(false);
  }, []);

  // Add subscription
  const addSubscription = (feedAddress: string) => {
    if (userData == null) {
      logger.error('Trying to add subscription with null user data');
      return;
    }

    userData.subscribedFeedAddresses.push(feedAddress);
    setIntakeCurrentUserData(userData);
  };

  // Remove subscription
  const removeSubscription = (feedAddress: string) => {
    if (userData == null) {
      logger.error('Trying to remove subscription with null user data');
      return;
    }

    pull(userData.subscribedFeedAddresses, feedAddress);
    setIntakeCurrentUserData(userData);
  };

  const hookData: UseIntakeUserState = {
    isLoadingUser,
    user: userData,
    addSubscription,
    removeSubscription,
  };

  return hookData;
};

export default useIntakeUserUtils;
