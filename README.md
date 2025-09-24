# Flotix Frontend - Standalone Deployment

This is a standalone deployment package for the Flotix Fleet Management frontend application.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

3. **Deploy**
   ```bash
   ./deploy.sh
   ```

## Configuration

### Environment Variables (.env.local)

- `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL (e.g., `http://your-server:3001/api`)
- `NEXT_PUBLIC_APP_NAME`: Application name (default: Flotix Fleet Management)
- `NEXT_PUBLIC_COMPANY_NAME`: Company name (default: Flotix)

### Backend Integration

Make sure your backend server:
1. Is running and accessible from this frontend
2. Has CORS configured to allow requests from this frontend URL
3. Is deployed using the companion backend deployment package

## Manual Deployment Steps

1. **Prepare Server**
   - Install Node.js 18 or higher
   - Install npm or yarn

2. **Deploy Files**
   ```bash
   # Copy this entire folder to your server
   scp -r frontend-deploy/ user@your-server:/path/to/deployment/
   ```

3. **Install and Build**
   ```bash
   cd /path/to/deployment/frontend-deploy/
   npm install
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   # Or use PM2 for production
   npm install -g pm2
   pm2 start npm --name "flotix-frontend" -- start
   ```

## Production Deployment Options

### Option 1: Direct Node.js
```bash
npm run build
npm start
```

### Option 2: PM2 Process Manager
```bash
npm install -g pm2
pm2 start npm --name "flotix-frontend" -- start
pm2 save
pm2 startup
```

### Option 3: Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript validation
- `./deploy.sh` - Automated deployment script

## Features

- **Admin Dashboard**: Complete fleet management interface
- **User Management**: Role-based access control
- **Vehicle Management**: Fleet tracking and assignment
- **Expense Management**: Receipt processing with OCR
- **Reports & Analytics**: Dashboard with KPIs and charts
- **Multi-language Support**: English and German translations
- **Responsive Design**: Works on desktop and mobile

## User Roles

- **Super Admin**: System-wide management, company creation
- **Admin**: Company management, driver oversight
- **Manager**: Limited administrative access
- **Driver**: Mobile app access (separate mobile deployment)

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## Troubleshooting

### Build Errors
- Ensure all TypeScript errors are resolved: `npm run type-check`
- Check that all dependencies are installed: `npm install`

### Runtime Errors
- Verify backend API is accessible
- Check CORS configuration in backend
- Ensure environment variables are set correctly

### Performance
- Enable Next.js optimizations in production
- Use CDN for static assets if needed
- Consider implementing caching strategies

## Support

For support and updates, refer to the main Flotix documentation or contact the development team.