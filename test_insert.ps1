$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Abrir proyecto wer
Write-Host "1. Abriendo proyecto wer..."
$resp1 = Invoke-WebRequest -Uri "http://localhost:8080/api/proyectos/wer" -WebSession $session -UseBasicParsing
Write-Host "Respuesta: $($resp1.StatusCode)"

# 2. Enviar inserción
Write-Host "2. Enviando inserción..."
$body = @{
    tipo = "entidadindividual"
    nombre = "TestPruebaX"
    apellidos = "ApellidoTest"
    descripcion = "Descripción test"
    estado = "activo"
    origenEntidad = "origen_test"
    comportamientoEntidad = "comportamiento_test"
} | ConvertTo-Json -Compress

$resp2 = Invoke-WebRequest -Uri "http://localhost:8080/api/bd/insertar" -Method POST -Body $body -ContentType "application/json" -WebSession $session -UseBasicParsing
Write-Host "Respuesta: $($resp2.StatusCode)"
Write-Host "Body: $($resp2.Content)"
