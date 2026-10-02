# befluent Deployment Guide

## Environment Variables Required for Production

When deploying to Render (or any production environment), make sure to set the following environment variables:

### Database Configuration

MongoDB is the only supported application database:

Configure the secret `MONGODB_URI` in the deployment environment's secure
secret settings. Never place its value in source code or documentation.

### NextAuth Configuration
```
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://your-app-domain.onrender.com
```

### Node Environment
```
NODE_ENV=production
```

## Deployment Steps for Render

1. **Connect your GitHub repository** to Render

2. **Set Environment Variables** in Render Dashboard:
   - Go to your service settings
   - Navigate to "Environment" tab
    - Add `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and the email/AI
      provider variables required by the enabled features.

3. **Build Command:**
   ```
   pnpm install --frozen-lockfile && pnpm run build
   ```

4. **Start Command:**
   ```
   pnpm start
   ```

5. **Important Notes:**
   - The active Prisma datasource is MongoDB and reads `MONGODB_URI`.
   - Do not run destructive schema commands against production.

## Test Accounts

After deployment, you can test with these accounts:

- **Admin:** admin@befluent.com / 123456
- **Teacher:** teacher@befluent.com / 123456
- **Student:** ahmed@student.com / 123456

## Troubleshooting

### Build fails with "MONGODB_URI undefined"
- Make sure `MONGODB_URI` is set in the deployment environment.

### Database connection fails
- Verify that MongoDB allows connections from Render's network
- Check that the MongoDB connection string is correct

### NextAuth errors
- Verify NEXTAUTH_SECRET is set and is at least 32 characters
- Ensure NEXTAUTH_URL matches your production domain

### Render build reports "Exit handler never called" and then "next: not found"
- `next` is already declared in `package.json`; the missing command is a consequence of the failed dependency installation.
- Set Render's Build Command to `pnpm install --frozen-lockfile && pnpm run build` and Start Command to `pnpm start`.
- Do not use `npm install; npm run build`: the semicolon starts the build even when installation fails, hiding the original failure behind `next: not found`.
- If the log still shows an `npm install` command, update the service's configured Build Command in Render.
