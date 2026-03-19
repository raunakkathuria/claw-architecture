import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const teamDirectoryRoot = path.resolve(moduleDir, "..", "..");
const databaseDirectory = path.join(teamDirectoryRoot, "database");
const defaultDatabasePath = path.join(databaseDirectory, "team.db");

export function getDefaultDatabasePath() {
  return process.env.DATABASE_PATH || defaultDatabasePath;
}

export function ensureDatabase(databasePath = getDefaultDatabasePath()) {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);

  const schemaSql = readFileSync(path.join(databaseDirectory, "schema.sql"), "utf8");
  db.exec(schemaSql);

  const countRow = db.prepare("SELECT COUNT(*) AS count FROM members").get();
  const count = Number(countRow?.count ?? 0);
  if (count === 0) {
    const seedSql = readFileSync(path.join(databaseDirectory, "seed.sql"), "utf8");
    db.exec(seedSql);
  }

  return db;
}

function mapMember(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createMemberStore(db) {
  return {
    list() {
      const rows = db.prepare(
        `
          SELECT id, name, role, email, created_at, updated_at
          FROM members
          ORDER BY name ASC
        `,
      ).all();

      return rows.map(mapMember);
    },

    get(id) {
      const row = db.prepare(
        `
          SELECT id, name, role, email, created_at, updated_at
          FROM members
          WHERE id = ?
        `,
      ).get(id);

      return mapMember(row);
    },

    create(input) {
      const result = db.prepare(
        `
          INSERT INTO members (name, role, email)
          VALUES (?, ?, ?)
          RETURNING id, name, role, email, created_at, updated_at
        `,
      ).get(input.name, input.role, input.email);

      return mapMember(result);
    },

    update(id, input) {
      const current = this.get(id);
      if (!current) {
        return null;
      }

      const nextName = input.name ?? current.name;
      const nextRole = input.role ?? current.role;
      const nextEmail = input.email ?? current.email;

      db.prepare(
        `
          UPDATE members
          SET
            name = ?,
            role = ?,
            email = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
      ).run(nextName, nextRole, nextEmail, id);

      return this.get(id);
    },

    delete(id) {
      const result = db.prepare("DELETE FROM members WHERE id = ?").run(id);
      return result.changes > 0;
    },
  };
}
