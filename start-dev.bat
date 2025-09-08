@echo off
echo Starting Hostel Booking Development Environment...
echo.
echo Starting Development Server...
start cmd /k "cd /d %~dp0 && set DATABASE_URL=file:./dev.db && npm run dev"
echo.
echo Starting Prisma Studio...
start cmd /k "cd /d %~dp0 && set DATABASE_URL=file:./dev.db && npx prisma studio --port 5555"
echo.
echo ============================================
echo Development environment is starting...
echo.
echo Server will be available at: http://localhost:3000 (or next available port)
echo Prisma Studio: http://localhost:5555
echo.
echo Chat System: Fully integrated with Claude API
echo ============================================
pause