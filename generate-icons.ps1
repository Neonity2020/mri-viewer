# Tauri图标生成脚本
# 需要安装ImageMagick: https://imagemagick.org/script/download.php#windows

$iconPath = "src-tauri\icons\icon.png"

# 检查ImageMagick是否安装
try {
    $null = Get-Command magick -ErrorAction Stop
    Write-Host "ImageMagick已安装，开始生成图标..." -ForegroundColor Green
} catch {
    Write-Host "ImageMagick未安装，请先安装ImageMagick:" -ForegroundColor Red
    Write-Host "下载地址: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "安装后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 定义需要的图标尺寸
$sizes = @(
    "32x32",
    "128x128", 
    "128x128@2x"
)

# 生成PNG图标
foreach ($size in $sizes) {
    $outputPath = "src-tauri\icons\$size.png"
    Write-Host "生成 $size 图标..." -ForegroundColor Cyan
    magick convert "$iconPath" -resize $size "$outputPath"
}

# 生成Windows ICO文件
Write-Host "生成Windows ICO图标..." -ForegroundColor Cyan
magick convert "$iconPath" -define icon:auto-resize=256,128,64,48,32,16 "src-tauri\icons\icon.ico"

# 生成macOS ICNS文件
Write-Host "生成macOS ICNS图标..." -ForegroundColor Cyan
magick convert "$iconPath" -resize 1024x1024 "src-tauri\icons\icon-1024.png"
magick convert "$iconPath" -resize 512x512 "src-tauri\icons\icon-512.png"
magick convert "$iconPath" -resize 256x256 "src-tauri\icons\icon-256.png"
magick convert "$iconPath" -resize 128x128 "src-tauri\icons\icon-128.png"
magick convert "$iconPath" -resize 64x64 "src-tauri\icons\icon-64.png"
magick convert "$iconPath" -resize 32x32 "src-tauri\icons\icon-32.png"
magick convert "$iconPath" -resize 16x16 "src-tauri\icons\icon-16.png"

# 创建ICNS文件（需要macOS或特殊工具）
Write-Host "注意: ICNS文件需要macOS或特殊工具生成" -ForegroundColor Yellow
Write-Host "请手动将PNG文件转换为ICNS格式" -ForegroundColor Yellow

# 生成Windows Store图标
$storeSizes = @(
    "Square30x30",
    "Square44x44", 
    "Square71x71",
    "Square89x89",
    "Square107x107",
    "Square142x142",
    "Square150x150",
    "Square284x284",
    "Square310x310"
)

foreach ($size in $storeSizes) {
    $outputPath = "src-tauri\icons\$size.png"
    Write-Host "生成 $size 图标..." -ForegroundColor Cyan
    magick convert "$iconPath" -resize $size "$outputPath"
}

Write-Host "图标生成完成！" -ForegroundColor Green
Write-Host "请检查 src-tauri\icons 目录中的文件" -ForegroundColor Green 