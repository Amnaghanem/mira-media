$port = 8082
$root = $PSScriptRoot
$url = "http://localhost:$port/"

Write-Host "Mira Media - local server"
Write-Host "Serving: $root"
Write-Host "Open:    $url"
Write-Host "Press Ctrl+C to stop."

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Start-Process $url

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $path = $context.Request.Url.LocalPath.TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
  $file = Join-Path $root ($path -replace '/', [IO.Path]::DirectorySeparatorChar)

  if (Test-Path $file -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $contentType = switch ($ext) {
      '.html' { 'text/html; charset=utf-8' }
      '.md'   { 'text/plain; charset=utf-8' }
      '.js'   { 'application/javascript; charset=utf-8' }
      '.css'  { 'text/css; charset=utf-8' }
      '.png'  { 'image/png' }
      '.jpg'  { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.webp' { 'image/webp' }
      '.svg'  { 'image/svg+xml' }
      default { 'application/octet-stream' }
    }
    $context.Response.ContentType = $contentType
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $context.Response.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes('Not found')
    $context.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $context.Response.Close()
}
