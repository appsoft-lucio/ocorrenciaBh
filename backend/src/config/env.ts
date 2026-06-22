function required(name: string, fallback?: string) {
  const value = process.env[name] || fallback;

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3333,
  host: process.env.HOST || "0.0.0.0",
  database: {
    host: required("DB_HOST", "127.0.0.1"),
    port: Number(process.env.DB_PORT) || 3050,
    path: required("DB_PATH"),
    user: required("DB_USER", "SYSDBA"),
    password: required("DB_PASSWORD"),
    charset: required("DB_CHARSET", "UTF8"),
  },
};
