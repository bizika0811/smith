param(
  [string]$OutputPath = "C:\Users\pc\Desktop\123\us-iran-monitor-files.docx"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("us-iran-monitor-docx-" + [guid]::NewGuid().ToString("N"))
$docRoot = Join-Path $tempRoot "docx"

$files = @(
  @{ Title = "README"; Path = (Join-Path $projectRoot "README.md") },
  @{ Title = "package.json"; Path = (Join-Path $projectRoot "package.json") },
  @{ Title = "scripts/build.mjs"; Path = (Join-Path $projectRoot "scripts\build.mjs") },
  @{ Title = "scripts/register-task.ps1"; Path = (Join-Path $projectRoot "scripts\register-task.ps1") },
  @{ Title = "scripts/run-build.ps1"; Path = (Join-Path $projectRoot "scripts\run-build.ps1") },
  @{ Title = "dist/data/latest.json"; Path = (Join-Path $projectRoot "dist\data\latest.json") },
  @{ Title = "dist/index.html"; Path = (Join-Path $projectRoot "dist\index.html") }
)

function Escape-XmlText {
  param([string]$Text)
  if ($null -eq $Text) { return "" }
  return [System.Security.SecurityElement]::Escape($Text)
}

function New-Paragraph {
  param(
    [string]$Text,
    [string]$Style = "Normal",
    [switch]$PreserveSpace
  )

  $escaped = Escape-XmlText $Text
  $spaceAttr = ""
  if ($PreserveSpace) {
    $spaceAttr = " xml:space=`"preserve`""
  }

  return "<w:p><w:pPr><w:pStyle w:val=`"$Style`"/></w:pPr><w:r><w:t$spaceAttr>$escaped</w:t></w:r></w:p>"
}

New-Item -ItemType Directory -Force $docRoot | Out-Null
New-Item -ItemType Directory -Force (Join-Path $docRoot "_rels") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $docRoot "word") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $docRoot "word\_rels") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $docRoot "docProps") | Out-Null
New-Item -ItemType Directory -Force (Split-Path -Parent $OutputPath) | Out-Null

$body = New-Object System.Collections.Generic.List[string]
$body.Add((New-Paragraph -Text "US-Iran Monitor Project File Export" -Style "Title"))
$body.Add((New-Paragraph -Text ("Export Time: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) -Style "Subtitle"))
$body.Add((New-Paragraph -Text ("Project Path: " + $projectRoot) -Style "Normal"))
$body.Add((New-Paragraph -Text "This document includes the project's core source files and latest generated outputs." -Style "Normal"))

foreach ($file in $files) {
  $body.Add((New-Paragraph -Text $file.Title -Style "Heading1"))
  $body.Add((New-Paragraph -Text $file.Path -Style "Path"))

  if (-not (Test-Path -LiteralPath $file.Path)) {
    $body.Add((New-Paragraph -Text "File not found." -Style "Code" -PreserveSpace))
    continue
  }

  $lines = Get-Content -LiteralPath $file.Path
  if ($null -eq $lines -or $lines.Count -eq 0) {
    $body.Add((New-Paragraph -Text "[empty file]" -Style "Code" -PreserveSpace))
    continue
  }

  foreach ($line in $lines) {
    $normalized = [string]$line -replace "`t", "    "
    $body.Add((New-Paragraph -Text $normalized -Style "Code" -PreserveSpace))
  }
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    $($body -join "`n    ")
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="180"/></w:pPr>
    <w:rPr>
      <w:b/><w:sz w:val="34"/>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120"/></w:pPr>
    <w:rPr>
      <w:color w:val="666666"/>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="220" w:after="100"/></w:pPr>
    <w:rPr>
      <w:b/><w:sz w:val="28"/>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Path">
    <w:name w:val="Path"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="80"/></w:pPr>
    <w:rPr>
      <w:color w:val="666666"/>
      <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:eastAsia="Microsoft YaHei"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Code">
    <w:name w:val="Code"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:eastAsia="Microsoft YaHei"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
</w:styles>
"@

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rootRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$documentRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@

$nowIso = (Get-Date).ToUniversalTime().ToString("s") + "Z"
$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>US-Iran Monitor Project File Export</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$nowIso</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$nowIso</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>
"@

Set-Content -LiteralPath (Join-Path $docRoot "[Content_Types].xml") -Value $contentTypesXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "_rels\.rels") -Value $rootRelsXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "word\document.xml") -Value $documentXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "word\styles.xml") -Value $stylesXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "word\_rels\document.xml.rels") -Value $documentRelsXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "docProps\core.xml") -Value $coreXml -Encoding utf8
Set-Content -LiteralPath (Join-Path $docRoot "docProps\app.xml") -Value $appXml -Encoding utf8

if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($docRoot, $OutputPath)

Write-Host "Created: $OutputPath"
