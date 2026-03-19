import http from "node:http";
import { ensureDatabase, createMemberStore, getDefaultDatabasePath } from "./db.mjs";

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(body);
}

function noContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

async function readJsonBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function parseId(pathname) {
  const match = pathname.match(/^\/api\/members\/(\d+)$/);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

function validateCreateBody(body) {
  const name = String(body.name ?? "").trim();
  const role = String(body.role ?? "").trim();
  const email = String(body.email ?? "").trim();

  if (!name || !role || !email) {
    const error = new Error("Fields name, role, and email are required.");
    error.statusCode = 400;
    throw error;
  }

  return { name, role, email };
}

function validateUpdateBody(body) {
  const output = {};
  for (const key of ["name", "role", "email"]) {
    if (body[key] !== undefined) {
      const value = String(body[key]).trim();
      if (!value) {
        const error = new Error(`Field ${key} cannot be empty.`);
        error.statusCode = 400;
        throw error;
      }
      output[key] = value;
    }
  }
  return output;
}

function handleSqliteError(error) {
  const message = String(error?.message ?? "Internal server error");
  if (message.includes("UNIQUE constraint failed")) {
    const conflict = new Error("A member with that email already exists.");
    conflict.statusCode = 409;
    throw conflict;
  }
  throw error;
}

export function createServer(options = {}) {
  const dbPath = options.dbPath || getDefaultDatabasePath();
  const db = ensureDatabase(dbPath);
  const members = createMemberStore(db);

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (req.method === "OPTIONS") {
        noContent(res);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/health") {
        json(res, 200, { status: "ok" });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/members") {
        json(res, 200, members.list());
        return;
      }

      const id = parseId(url.pathname);

      if (req.method === "GET" && id !== null) {
        const member = members.get(id);
        if (!member) {
          json(res, 404, { error: "Member not found." });
          return;
        }
        json(res, 200, member);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/members") {
        const body = validateCreateBody(await readJsonBody(req));
        try {
          const created = members.create(body);
          json(res, 201, created);
          return;
        } catch (error) {
          handleSqliteError(error);
        }
      }

      if (req.method === "PUT" && id !== null) {
        const body = validateUpdateBody(await readJsonBody(req));
        if (Object.keys(body).length === 0) {
          json(res, 400, { error: "At least one field must be provided." });
          return;
        }
        try {
          const updated = members.update(id, body);
          if (!updated) {
            json(res, 404, { error: "Member not found." });
            return;
          }
          json(res, 200, updated);
          return;
        } catch (error) {
          handleSqliteError(error);
        }
      }

      if (req.method === "DELETE" && id !== null) {
        const deleted = members.delete(id);
        if (!deleted) {
          json(res, 404, { error: "Member not found." });
          return;
        }
        json(res, 200, { success: true });
        return;
      }

      json(res, 404, { error: "Not found." });
    } catch (error) {
      const statusCode = Number(error?.statusCode || 500);
      json(res, statusCode, { error: error?.message || "Internal server error." });
    }
  });

  server.on("close", () => {
    db.close();
  });

  return server;
}

export async function startServer(options = {}) {
  const host = options.host ?? "0.0.0.0";
  const port = Number(options.port ?? process.env.PORT ?? 3001);
  const server = createServer(options);

  await new Promise((resolve) => {
    server.listen(port, host, resolve);
  });

  return server;
}
