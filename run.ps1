# FactoryMind AI – Startup Orchestrator

Clear-Host
Write-Host "=====================================================================" -ForegroundColor Emerald
Write-Host " FACTORYMIND AI – TEMPORAL OPERATIONS MEMORY SYSTEM" -ForegroundColor Emerald
Write-Host "=====================================================================" -ForegroundColor Emerald
Write-Host "Bootstrapping development environments..." -ForegroundColor Gray

# 1. Start backend FastAPI
Write-Host "● Launching FastAPI backend server on http://localhost:8000..." -ForegroundColor Emerald
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '--- FactoryMind AI Backend (FastAPI) Logs ---' -ForegroundColor Green; uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start frontend Next.js
Write-Host "● Launching Next.js frontend server on http://localhost:3000..." -ForegroundColor Emerald
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '--- FactoryMind AI Frontend (Next.js) Logs ---' -ForegroundColor Blue; npm run dev"

Write-Host "`nAll servers initiated successfully." -ForegroundColor Emerald
Write-Host "---------------------------------------------------------------------"
Write-Host "Dashboard URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "Backend API docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "To shut down, close the spawned PowerShell windows." -ForegroundColor Gray
Write-Host "=====================================================================" -ForegroundColor Emerald
