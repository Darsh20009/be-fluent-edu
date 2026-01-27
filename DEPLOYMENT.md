# befluent Deployment Guide

## Environment Variables Required for Production

When deploying to Render (or any production environment), make sure to set the following environment variables:

### Database Configuration

You have two options for database configuration:

#### Option 1: Using DATABASE_URL (Recommended for Render)
```
DATABASE_URL=postgresql://username:password@host:port/database?schema=befluent_exercisein
```

#### Option 2: Using AWS Database Credentials (Alternative)
```
AWS_DB_HOST=your-db-host.region.rds.amazonaws.com
AWS_DB_PORT=5432
AWS_DB_NAME=your-database-name
AWS_DB_USER=your-username
AWS_DB_PASSWORD=your-password
```

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
   - Add all required environment variables listed above

3. **Build Command:**
   ```
   npm install && npm run build
   ```

4. **Start Command:**
   ```
   npm start
   ```

5. **Important Notes:**
   - The `lib/prisma.ts` file is configured to handle missing DATABASE_URL during build
   - Make sure your database schema `befluent_exercisein` exists before deployment
   - Run `prisma db push` locally first to ensure schema is up to date

## Test Accounts

After deployment, you can test with these accounts:

- **Admin:** admin@befluent.com / 123456
- **Teacher:** teacher@befluent.com / 123456
- **Student:** ahmed@student.com / 123456

## Troubleshooting

### Build fails with "DATABASE_URL undefined"
- Make sure DATABASE_URL is set in environment variables
- Or ensure all AWS_DB_* variables are set correctly

### Database connection fails
- Verify your database allows connections from Render's IP addresses
- Check that your database credentials are correct
- Ensure the schema `befluent_exercisein` exists

### NextAuth errors
- Verify NEXTAUTH_SECRET is set and is at least 32 characters
- Ensure NEXTAUTH_URL matches your production domain
