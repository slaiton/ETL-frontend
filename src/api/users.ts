import { axiosClient } from "../shared/api/axiosClient";
import type { CreateUserPayload, UpdateUserPayload, User } from "../models/users.model";

export async function getUsers(): Promise<User[]> {
  try {
    const res = await axiosClient.get("/users/");
    return res.data?.data ?? res.data ?? [];
  } catch (error) {
    console.error("❌ Error en getUsers:", error);
    return [];
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const res = await axiosClient.get(`/users/${id}/`);
    return res.data?.data ?? res.data ?? null;
  } catch (error) {
    console.error("❌ Error en getUserById:", error);
    return null;
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User | null> {
  try {
    const res = await axiosClient.post("/register/", payload);
    return res.data?.data ?? res.data ?? null;
  } catch (error) {
    console.error("❌ Error en createUser:", error);
    throw error;
  }
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User | null> {
  try {
    const res = await axiosClient.patch(`/users/${id}/`, payload);
    return res.data?.data ?? res.data ?? null;
  } catch (error) {
    console.error("❌ Error en updateUser:", error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    await axiosClient.delete(`/users/${id}/`);
    return true;
  } catch (error) {
    console.error("❌ Error en deleteUser:", error);
    throw error;
  }
}
