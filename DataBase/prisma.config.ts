import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.database_URL!,
  },
})
