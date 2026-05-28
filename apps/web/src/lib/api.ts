const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    me: () => request<{ user: User }>("/auth/me"),
    login: (email: string, password: string) =>
      request<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, name: string, password: string) =>
      request<{ user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },
  servers: {
    list: () => request<Server[]>("/servers"),
    create: (data: CreateServerInput) =>
      request<{ id: string; status: string }>("/servers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ping: (id: string) => request<{ status: string }>(`/servers/${id}/ping`),
    delete: (id: string) =>
      request(`/servers/${id}`, { method: "DELETE" }),
  },
  stats: {
    get: (serverId: string) => request<ServerStats>(`/stats/${serverId}`),
  },
  domains: {
    list: () => request<Domain[]>("/domains"),
    create: (data: CreateDomainInput) =>
      request<{ id: string; name: string }>("/domains", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    enableSSL: (id: string) =>
      request(`/domains/${id}/ssl`, { method: "POST" }),
    delete: (id: string) =>
      request(`/domains/${id}`, { method: "DELETE" }),
  },
  sites: {
    list: () => request<Site[]>("/sites"),
    create: (data: CreateSiteInput) =>
      request<{ id: string; name: string }>("/sites", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request(`/sites/${id}`, { method: "DELETE" }),
  },
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "client";
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: "online" | "offline" | "unknown";
  createdAt: Date;
}

export interface ServerStats {
  cpu: number;
  memory: { used: number; total: number };
  disk: { used: string; total: string };
  uptime: string;
}

export interface Domain {
  id: string;
  name: string;
  serverId: string;
  sslEnabled: boolean;
  docRoot: string;
  createdAt: Date;
}

export interface Site {
  id: string;
  name: string;
  type: "static" | "php" | "node" | "python";
  status: "running" | "stopped" | "deploying" | "error";
  domainId: string;
  createdAt: Date;
}

export interface CreateServerInput {
  name: string;
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

export interface CreateDomainInput {
  name: string;
  serverId: string;
  docRoot?: string;
}

export interface CreateSiteInput {
  name: string;
  domainId: string;
  type: "static" | "php" | "node" | "python";
}
