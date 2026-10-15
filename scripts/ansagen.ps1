param([string]$Ziel)
# Erzeugt die Navi-Ansagen als WAV mit der lokalen Windows-Stimme (WinRT, OneCore-Stimmen wie Katja).
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
} | Select-Object -First 1

function Warte($op, [Type]$typ) {
  $task = $asTask.MakeGenericMethod($typ).Invoke($null, @($op))
  $task.Wait() | Out-Null
  $task.Result
}

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$stimme = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -like '*Katja*' } | Select-Object -First 1
if (-not $stimme) { $stimme = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.Language -like 'de*' } | Select-Object -First 1 }
$synth.Voice = $stimme
Write-Output "Stimme: $($stimme.DisplayName)"

$ansagen = [ordered]@{
  'ansage-300.wav'        = 'In dreihundert Metern rechts abbiegen, auf die Hauptstraße.'
  'ansage-200.wav'        = 'In zweihundert Metern rechts abbiegen, auf die Hauptstraße.'
  'ansage-100.wav'        = 'In hundert Metern rechts abbiegen, auf die Hauptstraße.'
  'ansage-jetzt.wav'      = 'Jetzt rechts abbiegen, auf die Hauptstraße.'
  'ansage-invertiert.wav' = 'Weiter vorne abbiegen.'
}
foreach ($datei in $ansagen.Keys) {
  $strom = Warte ($synth.SynthesizeTextToStreamAsync($ansagen[$datei])) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $leser = New-Object Windows.Storage.Streams.DataReader($strom.GetInputStreamAt(0))
  $laenge = [uint32]$strom.Size
  $null = Warte ($leser.LoadAsync($laenge)) ([uint32])
  $bytes = New-Object byte[] $laenge
  $leser.ReadBytes($bytes)
  [IO.File]::WriteAllBytes((Join-Path $Ziel $datei), $bytes)
  Write-Output "$datei : $laenge Bytes"
}
