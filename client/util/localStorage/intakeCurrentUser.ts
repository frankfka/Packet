const INTAKE_USER_LOCAL_STORAGE_KEY = 'PACKET_INTAKE.userData';

// User data stored in LocalStorage
export type IntakeUser = {
  subscribedFeedAddresses: string[]; // Array of subscriptions to the root addresses
};

export const getIntakeCurrentUserData = (): IntakeUser => {
  const existingData = localStorage.getItem(INTAKE_USER_LOCAL_STORAGE_KEY);

  if (existingData) {
    return JSON.parse(existingData) as IntakeUser;
  }

  let newUser: IntakeUser = {
    subscribedFeedAddresses: [],
  };
  setIntakeCurrentUserData(newUser);

  return newUser;
};

export const setIntakeCurrentUserData = (user: IntakeUser) => {
  localStorage.setItem(INTAKE_USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
};
