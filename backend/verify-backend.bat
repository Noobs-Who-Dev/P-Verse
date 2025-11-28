@echo off
echo ============================================
echo Backend Verification Script
echo ============================================
echo.

echo [1/4] Checking if backend is running on port 8080...
netstat -ano | findstr :8080
if errorlevel 1 (
    echo ERROR: Backend is NOT running on port 8080
    echo.
    echo Please start backend with: cd backend; mvnw spring-boot:run
    pause
    exit /b 1
) else (
    echo SUCCESS: Backend is running on port 8080
)
echo.

echo [2/4] Testing HTTP endpoint...
curl -s http://localhost:8080/api/auth/login -o nul
if errorlevel 1 (
    echo WARNING: Backend may not be fully started yet
) else (
    echo SUCCESS: Backend HTTP endpoints responding
)
echo.

echo [3/4] Testing WebSocket endpoint...
curl -s http://localhost:8080/ws -o nul
if errorlevel 1 (
    echo INFO: WebSocket endpoint check (expected behavior for WS)
) else (
    echo INFO: WebSocket endpoint accessible
)
echo.

echo [4/4] Instructions for testing messaging...
echo.
echo To test messaging:
echo 1. Open http://localhost:3000 in browser
echo 2. Login with a user account
echo 3. Open Console (F12)
echo 4. Check for: "WebSocket Connected!"
echo 5. Go to Messages, select a friend
echo 6. Type a message and press ENTER
echo 7. Check backend console for: "=== WebSocket Message Received ==="
echo.
echo If you see backend log, the fix is working!
echo If NOT, check CRITICAL_FIX.md for troubleshooting
echo.

pause

