<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        body { margin: 0; padding: 0; font-family: DejaVu Sans, sans-serif; }
        .page {
            width: 242.65pt;
            height: 153.07pt;
            page-break-after: always;
            position: relative;
        }
        .page:last-child { page-break-after: avoid; }
        .recto img.card { width: 100%; height: 100%; }
        .verso {
            background: #ffffff;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 14pt;
            text-align: center;
        }
        .verso .logo { width: 36pt; margin-bottom: 6pt; }
        .verso .qr { width: 60pt; height: 60pt; margin: 6pt auto; }
        .verso p { margin: 2pt 0; color: #17211F; font-size: 7pt; }
        .verso .muted { color: #66736F; font-size: 6pt; }
    </style>
</head>
<body>
    <div class="page recto">
        <img class="card" src="{{ $cardImage }}" alt="PECI">
    </div>
    <div class="page">
        <div class="verso">
            <img class="logo" src="{{ $logoImage }}" alt="PECI">
            <img class="qr" src="{{ $qrImage }}" alt="QR Code">
            <p><strong>Scanner pour vérifier cette carte</strong></p>
            <p class="muted">PECI — Promouvoir l'éducation en Côte d'Ivoire</p>
            <p class="muted">info@peci-ci.com — +225 07 00 00 18 92 — www.peci-ci.com</p>
        </div>
    </div>
</body>
</html>
