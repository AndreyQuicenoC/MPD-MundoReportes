#!/usr/bin/env pwsh
# Script para verificar la conexión entre Frontend y Backend desplegados

Write-Host "🔍 VERIFICACIÓN DE DESPLIEGUE - Mundo Reporte" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# URLs de producción
$BACKEND_URL = "https://mundoreportes.onrender.com"
$FRONTEND_URL = "https://mundoreportes.vercel.app"
$API_LOGIN = "$BACKEND_URL/api/auth/login/"

Write-Host "📍 URLs Configuradas:" -ForegroundColor Yellow
Write-Host "   Backend:  $BACKEND_URL" -ForegroundColor White
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Test 1: Verificar que el backend está online
Write-Host "1️⃣  Verificando Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $BACKEND_URL -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 301 -or $response.StatusCode -eq 404) {
        Write-Host "   ✅ Backend está ONLINE (Status: $($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Backend NO responde: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Verifica que el servicio esté desplegado en Render" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Verificar endpoint de API
Write-Host "2️⃣  Verificando API Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $API_LOGIN -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ API Endpoint responde (Status: $($response.StatusCode))" -ForegroundColor Green
    if ($response.StatusCode -eq 405) {
        Write-Host "   ℹ️  Status 405 es normal (GET no permitido, requiere POST)" -ForegroundColor DarkGray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405) {
        Write-Host "   ✅ API Endpoint funciona (405 = método no permitido)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error al conectar: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Verificar CORS headers
Write-Host "3️⃣  Verificando CORS..." -ForegroundColor Cyan
try {
    $headers = @{
        "Origin" = $FRONTEND_URL
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
    }
    $response = Invoke-WebRequest -Uri $API_LOGIN -Method OPTIONS -Headers $headers -UseBasicParsing -TimeoutSec 10
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "   ✅ CORS configurado correctamente" -ForegroundColor Green
        Write-Host "   ℹ️  Allow-Origin: $corsHeader" -ForegroundColor DarkGray
    } else {
        Write-Host "   ⚠️  No se encontró header CORS" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar CORS: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Intentar login de prueba
Write-Host "4️⃣  Probando Login API..." -ForegroundColor Cyan
try {
    $body = @{
        email = "admin@mundoreporte.com"
        password = "Admin123!@#"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
        "Origin" = $FRONTEND_URL
    }

    $response = Invoke-RestMethod -Uri $API_LOGIN -Method POST -Body $body -Headers $headers -TimeoutSec 15
    
    if ($response.access) {
        Write-Host "   ✅ LOGIN EXITOSO!" -ForegroundColor Green
        Write-Host "   ℹ️  Access Token recibido: $($response.access.Substring(0,20))..." -ForegroundColor DarkGray
        Write-Host "   ℹ️  Usuario: $($response.user.email)" -ForegroundColor DarkGray
    } else {
        Write-Host "   ⚠️  Respuesta inesperada" -ForegroundColor Yellow
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "   ❌ Error en login (Status: $statusCode)" -ForegroundColor Red
    
    if ($errorDetails -match "connection") {
        Write-Host "   💡 ERROR DE CONEXIÓN A BASE DE DATOS" -ForegroundColor Yellow
        Write-Host "   📋 Posibles causas:" -ForegroundColor Yellow
        Write-Host "      - DATABASE_URL mal configurado en Render" -ForegroundColor White
        Write-Host "      - Problema de IPv6 (revisa SOLUCION_DESPLIEGUE.md)" -ForegroundColor White
        Write-Host "      - Supabase inaccesible desde Render" -ForegroundColor White
    } elseif ($errorDetails -match "Invalid credentials") {
        Write-Host "   ℹ️  Backend funciona pero credenciales incorrectas" -ForegroundColor Yellow
    } else {
        Write-Host "   📄 Detalles: $errorDetails" -ForegroundColor White
    }
}
Write-Host ""

# Test 5: Verificar Frontend
Write-Host "5️⃣  Verificando Frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend está ONLINE" -ForegroundColor Green
        
        # Verificar que el HTML incluye la referencia al backend
        if ($response.Content -match "VITE_API_URL" -or $response.Content -match "script") {
            Write-Host "   ✅ Página cargada correctamente" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ❌ Frontend NO responde: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Resumen final
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "✅ = Funciona correctamente" -ForegroundColor Green
Write-Host "⚠️  = Advertencia, puede funcionar con limitaciones" -ForegroundColor Yellow
Write-Host "❌ = Error crítico, requiere atención" -ForegroundColor Red
Write-Host ""
Write-Host "📚 Documentación útil:" -ForegroundColor Cyan
Write-Host "   - SOLUCION_DESPLIEGUE.md  → Guía paso a paso" -ForegroundColor White
Write-Host "   - RENDER_CONFIG.md        → Configuración de variables" -ForegroundColor White
Write-Host "   - SUPABASE_VERIFICACION.md → Info de la base de datos" -ForegroundColor White
Write-Host ""

# Información adicional para debugging
Write-Host "🔧 DEBUGGING ADICIONAL" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "Para probar manualmente desde el navegador:" -ForegroundColor White
Write-Host ""
Write-Host "1. Abre la consola en $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "2. Ejecuta este código:" -ForegroundColor Cyan
Write-Host ""
Write-Host @"
fetch('$API_LOGIN', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@mundoreporte.com',
    password: 'Admin123!@#'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
"@ -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Verificación completada" -ForegroundColor Green
