import { axiosClient } from "../shared/api/axiosClient";
import type { Role, CreateRolePayload, UpdateRolePayload } from "../models/roles.model";

export async function getRoles(): Promise<Role[]> {
  const res = await axiosClient.get("/roles/");
  return res.data?.data ?? [];
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const res = await axiosClient.post("/roles/", payload);
  return res.data?.data;
}

export async function updateRole(id: number, payload: UpdateRolePayload): Promise<Role> {
  const res = await axiosClient.patch(`/roles/${id}/`, payload);
  return res.data?.data;
}

export async function deleteRole(id: number): Promise<void> {
  await axiosClient.delete(`/roles/${id}/`);
}
