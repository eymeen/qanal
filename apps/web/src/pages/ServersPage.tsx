import { useEffect, useState } from "react";
import { api, type Server, type CreateServerInput } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCw, Server as ServerIcon } from "lucide-react";
import { toast } from "sonner";

export function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateServerInput>({ name: "", host: "", port: 22, username: "root", privateKey: "" });

  useEffect(() => { api.servers.list().then(setServers); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.servers.create(form);
      setServers(await api.servers.list());
      setOpen(false);
      setForm({ name: "", host: "", port: 22, username: "root", privateKey: "" });
      toast.success("Server added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add server");
    } finally {
      setLoading(false);
    }
  }

  async function handlePing(id: string) {
    try {
      const { status } = await api.servers.ping(id);
      setServers((prev) => prev.map((s) => s.id === id ? { ...s, status: status as Server["status"] } : s));
      toast.success(`Server is ${status}`);
    } catch { toast.error("Ping failed"); }
  }

  async function handleDelete(id: string) {
    try {
      await api.servers.delete(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Server removed");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Servers</h1>
          <p className="text-sm text-muted-foreground">Manage VPS connections</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Server</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Server</DialogTitle>
              <DialogDescription>Connect a VPS via SSH private key</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Production VPS" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>Host / IP</Label>
                  <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} required placeholder="1.2.3.4" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>SSH Private Key</Label>
                <Textarea
                  value={form.privateKey}
                  onChange={(e) => setForm({ ...form, privateKey: e.target.value })}
                  required
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                  className="font-mono text-xs min-h-[120px]"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Connecting..." : "Add Server"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {servers.map((server) => (
          <Card key={server.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ServerIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{server.name}</CardTitle>
                    <CardDescription>{server.username}@{server.host}:{server.port}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={server.status === "online" ? "success" : server.status === "offline" ? "destructive" : "secondary"}>
                    {server.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handlePing(server.id)} title="Ping">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(server.id)} className="text-destructive hover:text-destructive" title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {servers.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ServerIcon className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No servers connected</p>
              <p className="text-xs text-muted-foreground mt-1">Add a VPS using its SSH private key</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
