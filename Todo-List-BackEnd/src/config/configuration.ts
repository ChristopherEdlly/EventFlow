export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    url: process.env.SQLITE_DATABASE_URL || 'file:./dev.db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'devsecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
});
