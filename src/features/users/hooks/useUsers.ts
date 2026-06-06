import { useState, useCallback } from "react";
import type { User } from "../../../models/users.model";
import { getUsers } from "../../../api/users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { users, loading, fetchUsers };
}
