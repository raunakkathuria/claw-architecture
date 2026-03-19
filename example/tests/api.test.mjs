import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { startServer } from "../api/src/server.mjs";

let tempDir;
let server;
let baseUrl;

test.before(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "team-directory-test-"));
  const dbPath = path.join(tempDir, "team.db");
  server = await startServer({ host: "127.0.0.1", port: 0, dbPath });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 3001;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
});

test("health endpoint returns ok", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload, { status: "ok" });
});

test("seeded members are returned", async () => {
  const response = await fetch(`${baseUrl}/api/members`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.length, 3);
  assert.equal(payload[0].name, "Ava Stone");
});

test("create, update, and delete member flow works", async () => {
  const createResponse = await fetch(`${baseUrl}/api/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Jordan Lee",
      role: "Frontend Engineer",
      email: "jordan.lee@example.com",
    }),
  });

  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.email, "jordan.lee@example.com");
  assert.equal(typeof created.id, "number");

  const updateResponse = await fetch(`${baseUrl}/api/members/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "Senior Frontend Engineer" }),
  });

  assert.equal(updateResponse.status, 200);
  const updated = await updateResponse.json();
  assert.equal(updated.role, "Senior Frontend Engineer");

  const deleteResponse = await fetch(`${baseUrl}/api/members/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 200);

  const getResponse = await fetch(`${baseUrl}/api/members/${created.id}`);
  assert.equal(getResponse.status, 404);
});

test("duplicate email returns conflict", async () => {
  const response = await fetch(`${baseUrl}/api/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Person",
      role: "Engineer",
      email: "ava.stone@example.com",
    }),
  });

  assert.equal(response.status, 409);
  const payload = await response.json();
  assert.equal(payload.error, "A member with that email already exists.");
});
