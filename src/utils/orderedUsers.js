const getUserKey = (user) => {
  const key = user?.id ?? user?.pk ?? user?.username;
  return key === undefined || key === null ? null : String(key);
};

export const uniqueUsersInOrder = (users = []) => {
  const seen = new Set();
  const orderedUsers = [];

  for (const user of users) {
    const key = getUserKey(user);
    if (!key) {
      orderedUsers.push(user);
      continue;
    }

    if (!seen.has(key)) {
      seen.add(key);
      orderedUsers.push(user);
    }
  }

  return orderedUsers;
};

export const mergeUsersInOrder = (currentUsers = [], nextUsers = []) => (
  uniqueUsersInOrder([...currentUsers, ...nextUsers])
);
