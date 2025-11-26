import { defineDatasourceConfig } from '@prisma/client';

export default defineDatasourceConfig({
  provider: 'sqlite',
  url: process.env.SQLITE_DATABASE_URL,
});
