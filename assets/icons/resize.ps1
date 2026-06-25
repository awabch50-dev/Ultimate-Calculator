Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\Track Computers\Desktop\CALCULATOR PR FOR AWAB AHMAD\assets\icons\logo-512.png")
$bmp = New-Object System.Drawing.Bitmap 192, 192
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 192, 192)
$bmp.Save("c:\Users\Track Computers\Desktop\CALCULATOR PR FOR AWAB AHMAD\assets\icons\logo-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
