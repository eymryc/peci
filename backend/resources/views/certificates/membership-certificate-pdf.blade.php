<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            color: #17211F;
        }
        .page {
            width: 842pt;
            height: 595pt;
            position: relative;
            box-sizing: border-box;
        }
        .band-top, .band-bottom {
            position: absolute;
            left: 0; right: 0;
            height: 14pt;
        }
        .band-top { top: 0; background: #17A79D; }
        .band-bottom { bottom: 0; background: #8EC44C; }
        .content {
            padding: 26pt 90pt 20pt 90pt;
            text-align: center;
        }
        .logo { width: 40pt; }
        .brand {
            margin-top: 4pt;
            font-size: 14pt;
            font-weight: bold;
            color: #17A79D;
        }
        .brand-sub {
            font-size: 7pt;
            letter-spacing: 1pt;
            color: #66736F;
            text-transform: uppercase;
        }
        .title {
            margin-top: 16pt;
            font-size: 26pt;
            font-weight: bold;
            letter-spacing: 2pt;
            text-transform: uppercase;
            color: #17211F;
        }
        .title-underline {
            width: 90pt;
            height: 3pt;
            background: #8EC44C;
            margin: 8pt auto 0 auto;
        }
        .lead {
            margin-top: 16pt;
            font-size: 11pt;
            color: #66736F;
        }
        .name {
            margin-top: 6pt;
            font-size: 22pt;
            font-weight: bold;
            color: #128077;
        }
        .body-text {
            margin: 10pt auto 0 auto;
            max-width: 480pt;
            font-size: 10.5pt;
            line-height: 1.4;
            color: #17211F;
        }
        .meta {
            margin-top: 16pt;
            display: block;
        }
        .meta table {
            margin: 0 auto;
            border-collapse: collapse;
        }
        .meta td {
            padding: 3pt 22pt;
            font-size: 10pt;
            color: #17211F;
            border-top: 0.75pt solid #E2E8E6;
        }
        .meta td.label {
            color: #66736F;
            text-transform: uppercase;
            font-size: 8pt;
            letter-spacing: 0.5pt;
        }
        .footer {
            margin-top: 20pt;
            display: block;
        }
        .footer table {
            width: 100%;
        }
        .footer td {
            width: 50%;
            font-size: 9pt;
            color: #66736F;
            vertical-align: bottom;
        }
        .signature-line {
            width: 160pt;
            border-top: 1pt solid #17211F;
            margin: 0 auto 4pt auto;
        }
        .signature-name {
            font-size: 10pt;
            font-weight: bold;
            color: #17211F;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="band-top"></div>
        <div class="band-bottom"></div>
        <div class="content">
            <img class="logo" src="{{ $logoImage }}" alt="PECI">
            <div class="brand">PECI</div>
            <div class="brand-sub">Promouvoir l'éducation en Côte d'Ivoire</div>

            <div class="title">Certificat d'adhésion</div>
            <div class="title-underline"></div>

            <div class="lead">Ce certificat est décerné à</div>
            <div class="name">{{ mb_strtoupper($member->fullName()) }}</div>

            <div class="body-text">
                en qualité de <strong>{{ $member->membershipType?->name ?? 'membre' }}</strong> de l'ONG PECI,
                engagée depuis 2020 pour la promotion d'une éducation accessible, inclusive et de
                qualité en Côte d'Ivoire.
            </div>

            <div class="meta">
                <table>
                    <tr>
                        <td class="label">N&deg; membre</td>
                        <td class="label">Date d'adh&eacute;sion</td>
                        <td class="label">D&eacute;livr&eacute; le</td>
                    </tr>
                    <tr>
                        <td>{{ $member->member_number }}</td>
                        <td>{{ optional($member->joined_at)->format('d/m/Y') ?? '—' }}</td>
                        <td>{{ $issuedAt->format('d/m/Y') }}</td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                <table>
                    <tr>
                        <td style="text-align: left;">
                            PECI — Abidjan, C&ocirc;te d'Ivoire<br>
                            info@peci-ci.com — www.peci-ci.com
                        </td>
                        <td style="text-align: right;">
                            <div class="signature-line" style="margin-right: 0; margin-left: auto;"></div>
                            <div class="signature-name">Lybird Hien</div>
                            <div>Pr&eacute;sidente, fondatrice de PECI</div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
