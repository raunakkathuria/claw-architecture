import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { startServer } from "../api/src/server.mjs";

const tempDir = await mkdtemp(path.join(os.tmpdir(), "team-directory-smoke-"));
const dbPath = path.join(tempDir, "team.db");
const server = await startServer({ host: "127.0.0.1", port: 0, dbPath });
const address = server.address();
const port = typeof address === "object" && address ? address.port : 3001;
const baseUrl = `http://127.0.0.1:${port}`;

try {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.status, "ok");

  const members = await fetch(`${baseUrl}/api/members`);
  assert.equal(members.status, 200);
  const memberList = await members.json();
  assert.equal(Array.isArray(memberList), true);
  assert.equal(memberList.length >= 3, true);

  const createdResponse = await fetch(`${baseUrl}/api/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      role: "QA Engineer",
      email: "test.user@example.com",
    }),
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  assert.equal(created.name, "Test User");

  const updatedResponse = await fetch(`${baseUrl}/api/members/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Senior QA Engineer" }),
  });
  assert.equal(updatedResponse.status, 200);
  const updated = await updatedResponse.json();
  assert.equal(updated.role, "Senior QA Engineer");

  const deletedResponse = await fetch(`${baseUrl}/api/members/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(deletedResponse.status, 200);

  console.log("Smoke test passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
}
