import argparse
import os
import subprocess
import sys
import threading

import paramiko


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--existing-tunnel", action="store_true")
    parser.add_argument("--port", type=int, default=2222)
    args = parser.parse_args()
    tunnel = None
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        if not args.existing_tunnel:
            tunnel = subprocess.Popen(
                [
                    "az", "webapp", "create-remote-connection",
                    "--subscription", os.environ["AZURE_SUBSCRIPTION_ID"],
                    "--resource-group", os.environ["AZURE_RESOURCE_GROUP"],
                    "--name", os.environ["APP_SERVICE_NAME"],
                    "--port", str(args.port), "--timeout", "300",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                env={**os.environ, "PYTHONUNBUFFERED": "1"},
            )
            ready = threading.Event()

            def observe():
                for line in tunnel.stdout:
                    if "SSH is available" in line:
                        ready.set()

            threading.Thread(target=observe, daemon=True).start()
            if not ready.wait(90):
                raise RuntimeError("Authenticated App Service SSH tunnel did not become ready")

        client.connect(
            "127.0.0.1", port=args.port, username="root",
            password=os.environ.get("APP_SERVICE_SSH_PASSWORD", "Docker!"),
            allow_agent=False, look_for_keys=False, timeout=30,
        )
        remote = "bash -lc 'cd /home/site/wwwroot && npm run migrate && printf MIGRATIONS_OK'"
        stdin, stdout, stderr = client.exec_command(remote, timeout=180)
        stdin.close()
        output = stdout.read().decode("utf-8", errors="replace")
        errors = stderr.read().decode("utf-8", errors="replace")
        status = stdout.channel.recv_exit_status()
        print(output)
        if errors:
            print(errors, file=sys.stderr)
        if status != 0 or "MIGRATIONS_OK" not in output:
            raise RuntimeError(f"App-container migration failed with exit code {status}")
    finally:
        client.close()
        if tunnel is not None:
            tunnel.terminate()
            try:
                tunnel.wait(timeout=10)
            except subprocess.TimeoutExpired:
                tunnel.kill()
                tunnel.wait()


if __name__ == "__main__":
    main()