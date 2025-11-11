# ⚠️ Backend Not Running

## Quick Fix

The backend server is not running. Follow these steps:

### Step 1: Open Terminal in Backend Folder
```bash
cd backend
```

### Step 2: Start Backend
```bash
# Windows Command Prompt or PowerShell
mvnw.cmd spring-boot:run

# Git Bash / WSL / Mac / Linux
./mvnw spring-boot:run
```

### Step 3: Wait for Success Message
Look for:
```
Started PVerseApplication in X.XXX seconds
```

### Step 4: Refresh This Page
Once backend is running, refresh your browser.

## Verify Backend is Running

Open in browser: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

Should see: `{"status":"UP"}`

## Common Issues

### Port 8080 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

If you change the port, update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Database Connection Error
1. Ensure MySQL/PostgreSQL is running
2. Check database credentials in `application.properties`
3. Create database if needed:
```sql
CREATE DATABASE pverse;
```

## Need More Help?

See the full guide: `/BACKEND_SETUP.md` in the project root.

---

**TL;DR**: Run `mvnw.cmd spring-boot:run` in the `backend` folder, then refresh.

