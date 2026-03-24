#!/usr/bin/env python3
"""
Codexible full-stack deploy: builds and deploys both backend (Rust) and frontend (Next.js)
to the remote server via SSH.

Usage: python remote_deploy.py [--backend-only] [--frontend-only]
"""
import argparse
import paramiko
import time
import sys

HOST = "20.24.78.150"
PORT = 2222
USER = "lunakat"
PASSWORD = "lunaKat@1230"
DEPLOY_DIR = "/home/lunakat/codexible-deploy-20260321"

BACKEND_BUILD_CMD = (
    f"cd {DEPLOY_DIR}/backend && "
    "docker build "
    "--build-arg RUST_VERSION=1.88.0-slim-bookworm "
    "--build-arg DEBIAN_VERSION=12.9-slim "
    "--build-arg CARGO_CHEF_VERSION=0.1.72 "
    "-t codexible-backend:latest "
    "-f Dockerfile ."
)

FRONTEND_BUILD_CMD = (
    f"cd {DEPLOY_DIR} && "
    "docker build "
    "--build-arg NEXT_PUBLIC_API_URL=https://codexible.me "
    "--build-arg NEXT_PUBLIC_SITE_URL=https://codexible.me "
    "--build-arg NEXT_PUBLIC_BRAND_NAME=Codexible "
    "--build-arg NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK=false "
    "--build-arg API_INTERNAL_URL=http://backend:3001 "
    "-t codexible-frontend:latest "
    "-f Dockerfile ."
)


def run_command(ssh_client, command, timeout=600, get_pty=False):
    """Run a command via SSH and return stdout."""
    print(f"\n[CMD] {command}")
    stdin, stdout, stderr = ssh_client.exec_command(command, get_pty=get_pty, timeout=timeout)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    if err:
        print(f"[STDERR] {err}")
    return out


def run_streaming(ssh_client, command, timeout=900):
    """Run a command and stream output line by line."""
    print(f"\n[CMD] {command}")
    transport = ssh_client.get_transport()
    channel = transport.open_session()
    channel.exec_command(command)
    channel.settimeout(timeout)

    full_output = []
    while True:
        if channel.recv_ready():
            data = channel.recv(4096).decode()
            print(data, end="")
            full_output.append(data)
        if channel.exit_status_ready():
            break
        time.sleep(0.2)

    exit_status = channel.recv_exit_status()
    full_output = "".join(full_output)
    return exit_status, full_output


def wait_for_healthy(ssh_client, service_name, project_name, check_cmd, timeout=120):
    """Wait for a service to become healthy."""
    container_name = f"{project_name}-{service_name}-1"
    print(f"\n[WAIT] Waiting for {service_name} ({container_name}) to become healthy...")
    start = time.time()
    while time.time() - start < timeout:
        result = run_command(ssh_client, check_cmd.format(container=container_name), timeout=15)
        if "healthy" in result.lower():
            print(f"[OK] {service_name} is healthy")
            return True
        if "none" in result.lower():
            # Container not found yet, keep waiting
            pass
        time.sleep(5)
    print(f"[WARN] {service_name} health check timed out after {timeout}s")
    return False


def main():
    parser = argparse.ArgumentParser(description="Deploy Codexible to remote server")
    parser.add_argument("--backend-only", action="store_true", help="Deploy backend only")
    parser.add_argument("--frontend-only", action="store_true", help="Deploy frontend only")
    args = parser.parse_args()

    deploy_backend = not args.frontend_only
    deploy_frontend = not args.backend_only

    print(f"Connecting to {HOST}:{PORT} as {USER}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD)
    print("Connected.\n")

    # Pull latest code from GitHub before building
    print("=" * 60)
    print("Pulling latest code from GitHub...")
    print("=" * 60)
    run_command(client, f"cd {DEPLOY_DIR} && git pull origin main", timeout=60)

    # Step 1: Build backend Docker image
    if deploy_backend:
        print("=" * 60)
        print("STEP 1: Building Backend Docker image (Rust)...")
        print("=" * 60)
        exit_status, output = run_streaming(client, BACKEND_BUILD_CMD, timeout=900)
        if exit_status != 0:
            print(f"\n[FAIL] Backend build exited with code {exit_status}")
            client.close()
            sys.exit(1)
        print("\n[OK] Backend build succeeded.")

        # Step 2: Deploy backend
        print("\n" + "=" * 60)
        print("STEP 2: Restarting Backend service...")
        print("=" * 60)

        # Stop old backend container
        run_command(client, "docker stop codexible-deploy-20260321-backend-1 || true", timeout=30)
        run_command(client, "docker rm codexible-deploy-20260321-backend-1 || true", timeout=30)

        # Bring up backend + postgres + redis via compose (backend depends on them)
        run_command(
            client,
            f"cd {DEPLOY_DIR} && docker compose up -d --no-deps backend postgres redis cliproxyapi",
            timeout=60,
        )

        # Wait for backend to be healthy
        wait_for_healthy(
            client, "backend", "codexible-deploy-20260321",
            "docker inspect --format='{{.State.Health.Status}}' {container} 2>/dev/null || echo 'none'",
            timeout=120,
        )
        print("[OK] Backend deployed.")
    else:
        print("[SKIP] Backend deploy skipped (--backend-only not set)")

    # Step 3: Build frontend Docker image
    if deploy_frontend:
        print("\n" + "=" * 60)
        print("STEP 3: Building Frontend Docker image (Next.js)...")
        print("=" * 60)
        exit_status, output = run_streaming(client, FRONTEND_BUILD_CMD, timeout=900)
        if exit_status != 0:
            print(f"\n[FAIL] Frontend build exited with code {exit_status}")
            client.close()
            sys.exit(1)
        print("\n[OK] Frontend build succeeded.")

        # Step 4: Deploy frontend
        print("\n" + "=" * 60)
        print("STEP 4: Restarting Frontend service...")
        print("=" * 60)

        run_command(
            client,
            f"cd {DEPLOY_DIR} && docker compose up -d --no-deps frontend",
            timeout=60,
        )

        # Wait for frontend to be healthy
        wait_for_healthy(
            client, "frontend", "codexible-deploy-20260321",
            "docker inspect --format='{{.State.Health.Status}}' {container} 2>/dev/null || echo 'none'",
            timeout=120,
        )
        print("[OK] Frontend deployed.")
    else:
        print("[SKIP] Frontend deploy skipped (--frontend-only not set)")

    # Step 5: Final verification
    print("\n" + "=" * 60)
    print("STEP 5: Final Status Report")
    print("=" * 60)

    containers = run_command(client, "docker ps --format '{{.Names}}\t{{.Status}}'", timeout=15)
    print(f"\nRunning containers:\n{containers}")

    # Check backend health
    backend_health = run_command(
        client,
        "curl -sf http://127.0.0.1:3001/health 2>/dev/null && echo 'OK' || echo 'DOWN'",
        timeout=10,
    )
    print(f"\nBackend /health: {backend_health.strip()}")

    # Check frontend
    frontend_status = run_command(
        client,
        "curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:10001 2>/dev/null || echo 'DOWN'",
        timeout=10,
    )
    print(f"Frontend HTTP: {frontend_status.strip()}")

    # Report BUILD_ID
    print("\n[CONTAINERS]:")
    for line in containers.strip().split("\n"):
        if line:
            print(f"  {line}")

    client.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
