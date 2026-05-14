@echo off
REM ComplianceTracker Start Script for Windows
REM Starts the Next.js dev server for localhost testing

echo 🚀 Starting ComplianceTracker...
echo.

if not exist "frontend\.env.local" (
    echo ❌ Error: frontend\.env.local not found
    echo.
    echo Please create frontend\.env.local with:
    echo   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    echo   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    echo.
    echo See SETUP.md for detailed instructions.
    pause
    exit /b 1
)

cd frontend

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo ✅ Starting dev server on http://localhost:3000
echo 📝 Logs:
echo.

call npm run dev
