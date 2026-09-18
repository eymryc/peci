<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MemberCard;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class MemberCardService
{
    // CR80 card at 300 DPI (85.6mm x 54mm).
    private const CARD_WIDTH = 1013;

    private const CARD_HEIGHT = 638;

    private const COLOR_TEAL = '#17A79D';

    private const COLOR_GREEN = '#8EC44C';

    private const COLOR_DARK = '#17211F';

    private const COLOR_GREY = '#66736F';

    public function __construct(private readonly ImageManager $images = new ImageManager(new Driver)) {}

    public function generateMemberNumber(): string
    {
        $year = now()->year;

        return DB::transaction(function () use ($year) {
            $count = Member::where('member_number', 'like', "PECI-{$year}-%")
                ->lockForUpdate()
                ->count();

            do {
                $count++;
                $number = sprintf('PECI-%d-%06d', $year, $count);
            } while (Member::where('member_number', $number)->exists());

            return $number;
        });
    }

    public function ensureMemberNumber(Member $member): void
    {
        if (! $member->member_number) {
            $member->update(['member_number' => $this->generateMemberNumber()]);
        }
    }

    public function issueCard(Member $member): MemberCard
    {
        $this->ensureMemberNumber($member);

        $existing = $member->card;
        $version = $existing ? $existing->version + 1 : 1;

        $issuedAt = now();
        $expiresAt = $member->expires_at ?? $issuedAt->copy()->addYear();

        $directory = "member-cards/{$member->member_number}";
        Storage::disk('local')->makeDirectory($directory);

        $qrPath = $this->generateQrCode($member, $directory);
        $imagePath = $this->generateCardImage($member, $directory, $issuedAt, $expiresAt, $qrPath);
        $pdfPath = $this->generateCardPdf($member, $issuedAt, $expiresAt, $imagePath, $qrPath);

        return MemberCard::updateOrCreate(
            ['member_id' => $member->id],
            [
                'card_number' => $member->member_number,
                'version' => $version,
                'qr_code_path' => $qrPath,
                'image_path' => $imagePath,
                'pdf_path' => $pdfPath,
                'status' => MemberCard::STATUS_VALID,
                'issued_at' => $issuedAt,
                'expires_at' => $expiresAt,
            ]
        );
    }

    public function revoke(Member $member): void
    {
        $member->card?->update(['status' => MemberCard::STATUS_REVOKED]);
    }

    public function suspend(Member $member): void
    {
        $member->card?->update(['status' => MemberCard::STATUS_SUSPENDED]);
    }

    public function expireCheck(Member $member): bool
    {
        $card = $member->card;

        if (! $card || $card->status !== MemberCard::STATUS_VALID) {
            return false;
        }

        if ($card->expires_at->isPast()) {
            $card->update(['status' => MemberCard::STATUS_EXPIRED]);

            return true;
        }

        return false;
    }

    private function generateQrCode(Member $member, string $directory): string
    {
        $verifyUrl = rtrim(config('app.frontend_url'), '/')."/verifier/{$member->member_number}";

        $result = (new Builder(
            writer: new PngWriter,
            data: $verifyUrl,
            size: 400,
            margin: 16,
            foregroundColor: new Color(23, 33, 31),
            backgroundColor: new Color(255, 255, 255),
        ))->build();

        $path = "{$directory}/qr.png";
        Storage::disk('local')->put($path, $result->getString());

        return $path;
    }

    // Mots qui entourent le logo PECI sur les supports de communication —
    // repris ici en filigrane discret sur le fond blanc de la carte.
    private const BRAND_WORDS = [
        ['text' => 'ÉDUCATION', 'size' => 15, 'angle' => 0, 'x' => 560, 'y' => 230, 'color' => '#17A79D22'],
        ['text' => 'PÉDAGOGIE', 'size' => 13, 'angle' => -3, 'x' => 800, 'y' => 235, 'color' => '#8EC44C28'],
        ['text' => 'INCLUSION', 'size' => 13, 'angle' => 2, 'x' => 590, 'y' => 275, 'color' => '#8EC44C28'],
        ['text' => 'ENSEIGNER', 'size' => 12, 'angle' => -2, 'x' => 830, 'y' => 285, 'color' => '#17A79D22'],
        ['text' => 'JEUNESSE', 'size' => 13, 'angle' => 3, 'x' => 700, 'y' => 320, 'color' => '#17A79D22'],
        ['text' => 'ALPHABÉTISATION', 'size' => 11, 'angle' => -2, 'x' => 570, 'y' => 355, 'color' => '#8EC44C28'],
        ['text' => 'CAUSES', 'size' => 12, 'angle' => 4, 'x' => 850, 'y' => 340, 'color' => '#8EC44C28'],
    ];

    private function generateCardImage(Member $member, string $directory, $issuedAt, $expiresAt, string $qrPath): string
    {
        $canvas = $this->images->create(self::CARD_WIDTH, self::CARD_HEIGHT)->fill('#ffffff');

        $fontRegular = resource_path('fonts/DejaVuSans.ttf');
        $fontBold = resource_path('fonts/DejaVuSans-Bold.ttf');

        $this->paintBrandWords($canvas, $fontBold);
        $this->paintDiagonalBanner($canvas, $fontBold);

        // En-tête : logo + séparateur + nom de la marque.
        $logoPath = resource_path('images/logo.jpg');
        if (is_file($logoPath)) {
            $logo = $this->images->read($logoPath)->scale(height: 100);
            $canvas->place($logo, 'top-left', 28, 26);
        }

        $canvas->drawLine(function ($line) {
            $line->from(150, 30)->to(150, 122)->color('#E2E8E6')->width(2);
        });

        $canvas->text('PECI', 172, 26, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(40);
            $font->color(self::COLOR_TEAL);
            $font->valign('top');
        });

        $canvas->text("PROMOUVOIR L'ÉDUCATION", 173, 76, function ($font) use ($fontRegular) {
            $font->filename($fontRegular);
            $font->size(15);
            $font->color(self::COLOR_DARK);
            $font->valign('top');
        });
        $canvas->text("EN CÔTE D'IVOIRE", 173, 96, function ($font) use ($fontRegular) {
            $font->filename($fontRegular);
            $font->size(15);
            $font->color(self::COLOR_DARK);
            $font->valign('top');
        });

        // Photo du membre, encadrée par des repères d'angle façon "cadrage photo".
        $photoX = 50;
        $photoY = 175;
        $photoSize = 230;

        if ($member->photo_path && Storage::disk('local')->exists($member->photo_path)) {
            $photo = $this->images->read(Storage::disk('local')->path($member->photo_path))
                ->cover($photoSize, $photoSize);
            $canvas->place($photo, 'top-left', $photoX, $photoY);
        } else {
            $canvas->drawRectangle($photoX, $photoY, function ($rectangle) use ($photoSize) {
                $rectangle->size($photoSize, $photoSize);
                $rectangle->background('#F5F8F7');
                $rectangle->border(self::COLOR_TEAL, 2);
            });
        }
        $this->paintPhotoCornerMarks($canvas, $photoX, $photoY, $photoSize);

        // Nom du membre + informations d'adhésion.
        $textX = $photoX + $photoSize + 40;

        $canvas->text(mb_strtoupper($member->fullName()), $textX, $photoY + 6, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(32);
            $font->color(self::COLOR_DARK);
            $font->valign('top');
        });
        $canvas->text('NOM & PRÉNOMS', $textX, $photoY + 48, function ($font) use ($fontRegular) {
            $font->filename($fontRegular);
            $font->size(13);
            $font->color(self::COLOR_GREY);
            $font->valign('top');
        });

        $rows = [
            'N° membre : '.$member->member_number,
            'Type de membre : '.($member->membershipType?->name ?? '—'),
            "Date d'adhésion : ".$issuedAt->format('d/m/Y'),
            "Date d'expiration : ".$expiresAt->format('d/m/Y'),
        ];

        $rowY = $photoY + 100;
        foreach ($rows as $row) {
            $canvas->drawCircle($textX + 8, $rowY + 10, function ($circle) {
                $circle->radius(8);
                $circle->background(self::COLOR_GREEN);
            });
            $canvas->text($row, $textX + 26, $rowY, function ($font) use ($fontRegular) {
                $font->filename($fontRegular);
                $font->size(19);
                $font->color(self::COLOR_DARK);
                $font->valign('top');
            });
            $rowY += 38;
        }

        // Signature de la carte.
        $taglineY = $rowY + 12;
        $canvas->text("L'éducation, un droit pour tous", $textX, $taglineY, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(19);
            $font->color(self::COLOR_TEAL);
            $font->valign('top');
        });
        $canvas->drawLine(function ($line) use ($textX, $taglineY) {
            $line->from($textX, $taglineY + 32)->to($textX + 260, $taglineY + 32)->color(self::COLOR_GREEN)->width(3);
        });

        // QR code encadré + mention de vérification.
        $qrSize = 150;
        $qrX = self::CARD_WIDTH - 46 - $qrSize;
        $qrY = 355;
        $canvas->drawRectangle($qrX - 8, $qrY - 8, function ($rectangle) use ($qrSize) {
            $rectangle->size($qrSize + 16, $qrSize + 16);
            $rectangle->background('#ffffff');
            $rectangle->border(self::COLOR_TEAL, 3);
        });
        $qr = $this->images->read(Storage::disk('local')->path($qrPath))->resize($qrSize, $qrSize);
        $canvas->place($qr, 'top-left', $qrX, $qrY);

        $canvas->drawRectangle($qrX - 8, $qrY + $qrSize + 16, function ($rectangle) use ($qrSize) {
            $rectangle->size($qrSize + 16, 34);
            $rectangle->background(self::COLOR_GREEN);
        });
        $canvas->text('Scanner pour vérifier', (int) ($qrX + $qrSize / 2 - 8), $qrY + $qrSize + 33, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(13);
            $font->color('#ffffff');
            $font->align('center');
            $font->valign('middle');
        });

        // Bandeau de contact en bas de carte.
        $this->paintFooter($canvas, $fontRegular, $fontBold);

        $path = "{$directory}/card.png";
        Storage::disk('local')->put($path, (string) $canvas->toPng());

        return $path;
    }

    /**
     * Bandeau diagonal "CARTE DE MEMBRE" en haut à droite, dans les couleurs
     * de la marque — imite le bandeau en dégradé du gabarit fourni par PECI.
     */
    private function paintDiagonalBanner($canvas, string $fontBold): void
    {
        $canvas->drawPolygon(function ($polygon) {
            $polygon->point(480, 0)->point(self::CARD_WIDTH, 0)->point(self::CARD_WIDTH, 210)->point(640, 210);
            $polygon->background(self::COLOR_TEAL);
        });
        $canvas->drawPolygon(function ($polygon) {
            $polygon->point(760, 105)->point(self::CARD_WIDTH, 105)->point(self::CARD_WIDTH, 210)->point(640, 210);
            $polygon->background(self::COLOR_GREEN);
        });

        $canvas->text('CARTE DE MEMBRE', 700, 32, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(27);
            $font->color('#ffffff');
            $font->valign('top');
        });
        $canvas->text("ENSEMBLE POUR L'ÉDUCATION", 700, 78, function ($font) use ($fontBold) {
            $font->filename($fontBold);
            $font->size(12);
            $font->color('#ffffffcc');
            $font->valign('top');
        });
        $canvas->drawLine(function ($line) {
            $line->from(700, 100)->to(830, 100)->color('#ffffffaa')->width(2);
        });
    }

    /**
     * Repères d'angle (façon cadrage photo) autour de la photo du membre.
     */
    private function paintPhotoCornerMarks($canvas, int $x, int $y, int $size): void
    {
        $offset = 14;
        $length = 38;
        $thickness = 6;

        // Haut-gauche.
        $canvas->drawRectangle($x - $offset, $y - $offset, function ($r) use ($length, $thickness) {
            $r->size($length, $thickness);
            $r->background(self::COLOR_GREEN);
        });
        $canvas->drawRectangle($x - $offset, $y - $offset, function ($r) use ($length, $thickness) {
            $r->size($thickness, $length);
            $r->background(self::COLOR_GREEN);
        });

        // Bas-droite.
        $canvas->drawRectangle($x + $size + $offset - $length, $y + $size + $offset - $thickness, function ($r) use ($length, $thickness) {
            $r->size($length, $thickness);
            $r->background(self::COLOR_GREEN);
        });
        $canvas->drawRectangle($x + $size + $offset - $thickness, $y + $size + $offset - $length, function ($r) use ($length, $thickness) {
            $r->size($thickness, $length);
            $r->background(self::COLOR_GREEN);
        });
    }

    /**
     * Filigrane discret des mots associés à la marque PECI, dispersés sur le
     * fond blanc entre l'en-tête et la photo.
     */
    private function paintBrandWords($canvas, string $fontBold): void
    {
        foreach (self::BRAND_WORDS as $word) {
            $canvas->text($word['text'], $word['x'], $word['y'], function ($font) use ($fontBold, $word) {
                $font->filename($fontBold);
                $font->size($word['size']);
                $font->color($word['color']);
                $font->angle($word['angle']);
                $font->valign('top');
            });
        }
    }

    /**
     * Bandeau de contact en dégradé, en bas de la carte.
     */
    private function paintFooter($canvas, string $fontRegular, string $fontBold): void
    {
        $footerHeight = 56;
        $footerY = self::CARD_HEIGHT - $footerHeight;

        [$r1, $g1, $b1] = $this->hexToRgb(self::COLOR_TEAL);
        [$r2, $g2, $b2] = $this->hexToRgb(self::COLOR_GREEN);
        $steps = 60;
        $stripWidth = (int) ceil(self::CARD_WIDTH / $steps);
        for ($i = 0; $i < $steps; $i++) {
            $t = $i / max(1, $steps - 1);
            $hex = sprintf(
                '#%02x%02x%02x',
                (int) round($r1 + ($r2 - $r1) * $t),
                (int) round($g1 + ($g2 - $g1) * $t),
                (int) round($b1 + ($b2 - $b1) * $t),
            );
            $canvas->drawRectangle($i * $stripWidth, $footerY, function ($rectangle) use ($stripWidth, $footerHeight, $hex) {
                $rectangle->size($stripWidth, $footerHeight);
                $rectangle->background($hex);
            });
        }

        $textY = (int) ($footerY + $footerHeight / 2 - 8);
        $canvas->text('Abidjan, Côte d\'Ivoire      info@peci-ci.com      www.peci-ci.com', 40, $textY, function ($font) use ($fontRegular) {
            $font->filename($fontRegular);
            $font->size(15);
            $font->color('#ffffff');
            $font->valign('top');
        });

        // Pastilles réseaux sociaux (initiales), alignées à droite du bandeau.
        $socials = ['f', 'X', 'in', 'W'];
        $bubbleRadius = 14;
        $bubbleX = self::CARD_WIDTH - 40 - $bubbleRadius;
        foreach ($socials as $initial) {
            $canvas->drawCircle($bubbleX, (int) ($footerY + $footerHeight / 2), function ($circle) use ($bubbleRadius) {
                $circle->radius($bubbleRadius);
                $circle->background('#ffffff');
            });
            $canvas->text($initial, $bubbleX, (int) ($footerY + $footerHeight / 2), function ($font) use ($fontBold) {
                $font->filename($fontBold);
                $font->size(13);
                $font->color(self::COLOR_TEAL);
                $font->align('center');
                $font->valign('middle');
            });
            $bubbleX -= ($bubbleRadius * 2 + 10);
        }
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    }

    private function generateCardPdf(Member $member, $issuedAt, $expiresAt, string $imagePath, string $qrPath): string
    {
        $pdf = \Pdf::loadView('cards.member-card-pdf', [
            'member' => $member,
            'issuedAt' => $issuedAt,
            'expiresAt' => $expiresAt,
            'cardImage' => Storage::disk('local')->path($imagePath),
            'qrImage' => Storage::disk('local')->path($qrPath),
            'logoImage' => resource_path('images/logo.jpg'),
        ])->setPaper([0, 0, 242.65, 153.07]); // CR80 in points (85.6mm x 54mm).

        $path = "member-cards/{$member->member_number}/card.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }
}
