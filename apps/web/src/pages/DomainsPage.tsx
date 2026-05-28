import { useEffect, useState } from "react";
import { api, type Domain, type Server } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

export function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", serverId: "", docRoot: "/var/www" });

  useEffect(() => {
    api.domains.list().then(setDomains);
    api.servers.list().then(setServers);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.domains.create(form);
      setDomains(await api.domains.list());
      setOpen(false);
      setForm({ name: "", serverId: "", docRoot: "/var/www" });
      toast.success("Domain configured");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setLoading(false);
    }
  }

  async function handleSSL(id: string) {
    try {
      await api.domains.enableSSL(id);
      setDomains((prev) => prev.map((d) => d.id === id ? { ...d, sslEnabled: true } : d));
      toast.success("SSL enabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "SSL failed");
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.domains.delete(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      toast.success("Domain removed");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-sm text-muted-foreground">Manage nginx vhosts and SSL</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Domain</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Domain</DialogTitle>
              <DialogDescription>Creates an nginx vhost on the selected server</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="example.com" />
              </div>
              <div className="space-y-2">
                <Label>Server</Label>
                <Select value={form.serverId} onValueChange={(v) => setForm({ ...form, serverId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a server" /></SelectTrigger>
                  <SelectContent>
                    {servers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.host})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Web Root Base</Label>
                <Input value={form.docRoot} onChange={(e) => setForm({ ...form, docRoot: e.target.value })} />
                <p className="text-xs text-muted-foreground">Final path: {form.docRoot}/{form.name || "domain"}/public</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading || !form.serverId}>{loading ? "Configuring..." : "Add Domain"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {domains.map((domain) => (
          <Card key={domain.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{domain.name}</CardTitle>
                    <CardDescription>{domain.docRoot}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={domain.sslEnabled ? "success" : "secondary"}>{domain.sslEnabled ? "HTTPS" : "HTTP"}</Badge>
                  {!domain.sslEnabled && (
                    <Button variant="outline" size="sm" onClick={() => handleSSL(domain.id)}>
                      <Shield className="h-3 w-3 mr-1" /> Enable SSL
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(domain.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {domains.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Globe className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No domains yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a domain to create an nginx vhost</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
