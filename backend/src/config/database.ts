import Firebird, {
  type ConnectionPool,
  type Database,
  type Options,
  type SupportedCharacterSet,
} from "node-firebird";
import { env } from "./env.js";

const options: Options = {
  host: env.database.host,
  port: env.database.port,
  database: env.database.path,
  user: env.database.user,
  password: env.database.password,
  encoding: env.database.charset as SupportedCharacterSet,
  lowercase_keys: true,
  pluginName: Firebird.AUTH_PLUGIN_SRP,
  wireCrypt: Firebird.WIRE_CRYPT_ENABLE,
  connectTimeout: 10_000,
};

const pool: ConnectionPool = Firebird.pool(5, options);

function getConnection(): Promise<Database> {
  return new Promise((resolve, reject) => {
    pool.get((error, database) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(database);
    });
  });
}

function detach(database: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    database.detach((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getConnection();

  try {
    return await new Promise<T[]>((resolve, reject) => {
      database.query(sql, params, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result as T[]);
      });
    });
  } finally {
    await detach(database);
  }
}

export async function checkDatabaseConnection() {
  const [result] = await query<{ connected: number }>(
    "SELECT 1 AS connected FROM RDB$DATABASE",
  );

  return result?.connected === 1;
}
