import { Client } from "ssh2";

export interface SSHResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface ServerCredentials {
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

export async function runCommand(
  creds: ServerCredentials,
  command: string
): Promise<SSHResult> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = "";
    let stderr = "";

    conn.on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream
          .on("close", (code: number) => {
            conn.end();
            resolve({ stdout, stderr, code });
          })
          .on("data", (data: Buffer) => {
            stdout += data.toString();
          })
          .stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
          });
      });
    });

    conn.on("error", reject);

    conn.connect({
      host: creds.host,
      port: creds.port,
      username: creds.username,
      privateKey: creds.privateKey,
      readyTimeout: 10000,
    });
  });
}

export async function testConnection(creds: ServerCredentials): Promise<boolean> {
  try {
    const result = await runCommand(creds, "echo ok");
    return result.code === 0 && result.stdout.trim() === "ok";
  } catch {
    return false;
  }
}
