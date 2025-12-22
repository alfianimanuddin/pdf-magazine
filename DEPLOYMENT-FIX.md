# Image Loading Fix for Production

## Problem
Images work in localhost but not in production at https://majalah.tadatodays.com/

## Root Cause
Next.js standalone mode doesn't automatically serve files from the `/public` directory. In development, the dev server handles this, but in production with `output: 'standalone'`, these files aren't accessible.

## Solutions

### Solution 1: API Route Serving (Current Implementation)

**Pros:**
- Works with existing docker-compose setup
- No changes needed to docker-compose.yml
- Nginx doesn't need access to upload files

**Cons:**
- Slightly slower (requests go through Next.js)
- Uses Node.js resources for file serving

**Files Changed:**
1. `app/api/uploads/[...path]/route.ts` - New API route to serve files
2. `next.config.js` - Added production domain, disabled image optimization
3. `nginx.conf` - Rewrites /uploads to /api/uploads

**Deployment:**
```bash
# 1. Commit changes
git add .
git commit -m "Fix image serving in production standalone mode"
git push origin master

# 2. On production server
cd /path/to/magazine-platform
git pull origin master

# 3. Rebuild and restart
docker-compose down
docker-compose build --no-cache app
docker-compose up -d

# 4. Test
curl -I https://majalah.tadatodays.com/api/uploads/magazines/[magazine-id]/pages/page-1.webp
```

---

### Solution 2: Nginx Direct Serving (Better Performance)

**Pros:**
- Much faster (nginx serves files directly)
- Lower CPU usage on app container
- Better caching control

**Cons:**
- Requires nginx container to have access to uploads volume
- Requires using alternative docker-compose file

**Files Provided:**
1. `nginx.conf.alternative` - Nginx config with direct file serving
2. `docker-compose.nginx-direct.yml` - Updated docker-compose with volume mount for nginx

**Deployment:**
```bash
# 1. Commit changes
git add .
git commit -m "Add nginx direct serving option for images"
git push origin master

# 2. On production server
cd /path/to/magazine-platform
git pull origin master

# 3. Switch to alternative configuration
docker-compose down
docker-compose -f docker-compose.nginx-direct.yml build --no-cache app
docker-compose -f docker-compose.nginx-direct.yml up -d

# 4. Test
curl -I https://majalah.tadatodays.com/uploads/magazines/[magazine-id]/pages/page-1.webp
```

---

## Verification Steps

After deployment, verify images are loading:

### 1. Check API Route (Solution 1)
```bash
# Should return 200 with image/webp content-type
curl -I https://majalah.tadatodays.com/api/uploads/magazines/cmjcniy120001137jw6bitfvz/pages/page-1.webp
```

### 2. Check Direct Route (Solution 2)
```bash
# Should return 200 with image/webp content-type
curl -I https://majalah.tadatodays.com/uploads/magazines/cmjcniy120001137jw6bitfvz/pages/page-1.webp
```

### 3. Check Website
Visit https://majalah.tadatodays.com/ and verify:
- Cover images display on homepage
- Magazine viewer shows all pages
- No broken image icons

### 4. Check Browser Console
- Open browser DevTools (F12)
- Look for any 404 or image loading errors
- Should see successful image loads

---

## Troubleshooting

### Images still not showing

**Check 1: Verify container has access to files**
```bash
docker exec magazine-app ls -la /app/public/uploads/magazines/
```

**Check 2: Check nginx logs**
```bash
docker-compose logs nginx | grep uploads
```

**Check 3: Check app logs**
```bash
docker-compose logs app | grep -i error
```

**Check 4: Verify API route is working**
```bash
# SSH into container
docker exec -it magazine-app sh
# Check if files exist
ls -la /app/public/uploads/magazines/*/pages/
```

### 404 Errors

If getting 404 errors:
1. Verify files exist in the uploads volume
2. Check nginx rewrite rules are correct
3. Verify Next.js app is running (check logs)
4. Test API route directly: `curl http://localhost:3001/api/uploads/...`

### 500 Errors

If getting 500 errors:
1. Check app logs: `docker-compose logs app`
2. Verify file permissions in uploads directory
3. Check NODE_ENV is set to 'production'

---

## Recommended Approach

For production, **Solution 2 (Nginx Direct Serving)** is recommended because:
- Better performance
- Lower server resource usage
- Standard approach for serving static files
- Nginx is optimized for file serving

Use **Solution 1 (API Route)** only if:
- You can't modify docker-compose configuration
- You need to process images on-the-fly
- You want simpler deployment

---

## Performance Comparison

**Solution 1 (API Route):**
- Request → Nginx → Next.js → Node.js File Read → Response
- ~50-100ms additional latency

**Solution 2 (Nginx Direct):**
- Request → Nginx → Direct File Read → Response
- ~5-10ms latency
- Nginx sendfile optimization

---

## Future Improvements

Consider these enhancements:
1. **CDN Integration**: Use Cloudflare or AWS CloudFront
2. **S3 Storage**: Move uploads to S3 or compatible object storage
3. **Image Optimization**: Use Next.js Image Optimization API with external storage
4. **Lazy Loading**: Implement progressive loading for magazine pages

---

## Files Modified/Added

### Modified:
- `next.config.js` - Added production domain, disabled optimization
- `nginx.conf` - Added rewrite for uploads

### Added:
- `app/api/uploads/[...path]/route.ts` - File serving API
- `nginx.conf.alternative` - Alternative nginx config
- `docker-compose.nginx-direct.yml` - Alternative docker-compose
- `DEPLOYMENT-FIX.md` - This guide

---

## Questions?

If images still aren't loading after deployment:
1. Check all verification steps above
2. Review troubleshooting section
3. Check docker logs for both app and nginx containers
4. Verify environment variables are set correctly
