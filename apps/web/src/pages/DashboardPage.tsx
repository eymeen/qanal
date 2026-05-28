import { useEffect, useState } from "react";
import { api, type Server, type ServerStats } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server as ServerIcon, Globe, Layout, Cpu, HardDrive, MemoryStick } from "lucide-react";

export function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [stats, setStats] = useState<Record<string, ServerStats>>({});

  useEffect(() => { api.servers.list().then(setServers); }, []);

  useEffect(() => {
    servers.forEach((s) => {
      if (s.status === "online") {
        api.stats.get(s.id).then((st) => setStats((prev) => ({ ...prev, [s.id]: st }))).catch(() => {});
      }
    });
  }, [servers]);

  const online = servers.filter((s) => s.status === "online").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your infrastructure</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><ServerIcon className="h-4 w-4" /> Servers</CardDescription>
            <CardTitle className="text-3xl">{servers.length}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">{online} online</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Globe className="h-4 w-4" /> Domains</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Go to Domains</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Layout className="h-4 w-4" /> Sites</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Go to Sites</p></CardContent>
        </Card>
      </div>

      {servers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Server Health</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {servers.map((server) => {
              const st = stats[server.id];
              return (
                <Card key={server.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{server.name}</CardTitle>
                      <Badge variant={server.status === "online" ? "success" : "destructive"}>{server.status}</Badge>
                    </div>
                    <CardDescription>{server.host}</CardDescription>
                  </CardHeader>
                  {st && (
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground"><Cpu className="h-3 w-3" /> CPU</span>
                          <span>{st.cpu.toFixed(1)}%</span>
                        </div>
                        <Progress value={st.cpu} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground"><MemoryStick className="h-3 w-3" /> RAM</span>
                          <span>{st.memory.used}MB / {st.memory.total}MB</span>
                        </div>
                        <Progress value={st.memory.total ? (st.memory.used / st.memory.total) * 100 : 0} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground"><HardDrive className="h-3 w-3" /> Disk</span>
                        <span>{st.disk.used} / {st.disk.total}</span>
                      </div>
                    </CardContent>
                  )}
                  {!st && server.status === "online" && (
                    <CardContent><p className="text-xs text-muted-foreground">Loading stats...</p></CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {servers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ServerIcon className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No servers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first server to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
