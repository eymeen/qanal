import { useEffect, useState } from "react";
import { api, type Site, type Domain } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Layout } from "lucide-react";
import { toast } from "sonner";

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", domainId: "", type: "static" as Site["type"] });

  useEffect(() => {
    api.sites.list().then(setSites);
    api.domains.list().then(setDomains);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sites.create(form);
      setSites(await api.sites.list());
      setOpen(false);
      setForm({ name: "", domainId: "", type: "static" });
      toast.success("Site deployed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deploy site");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.sites.delete(id);
      setSites((prev) => prev.filter((s) => s.id !== id));
      toast.success("Site removed");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sites</h1>
          <p className="text-sm text-muted-foreground">Deploy and manage websites</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Deploy Site</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deploy Site</DialogTitle>
              <DialogDescription>Creates a starter site on the selected domain</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="My Website" />
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={form.domainId} onValueChange={(v) => setForm({ ...form, domainId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a domain" /></SelectTrigger>
                  <SelectContent>
                    {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Site Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Site["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static HTML</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading || !form.domainId}>{loading ? "Deploying..." : "Deploy"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{site.name}</CardTitle>
                    <CardDescription>{site.type} site</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{site.type}</Badge>
                  <Badge variant={site.status === "running" ? "success" : "destructive"}>{site.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {sites.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Layout className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No sites yet</p>
              <p className="text-xs text-muted-foreground mt-1">Deploy a site to a configured domain</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
