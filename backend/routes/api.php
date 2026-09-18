<?php

use App\Http\Controllers\Api\Admin\ActionController as AdminActionController;
use App\Http\Controllers\Api\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\GalleryImageController as AdminGalleryImageController;
use App\Http\Controllers\Api\Admin\InterventionCityController as AdminInterventionCityController;
use App\Http\Controllers\Api\Admin\MemberController as AdminMemberController;
use App\Http\Controllers\Api\Admin\MembershipController as AdminMembershipController;
use App\Http\Controllers\Api\Admin\MembershipTypeController as AdminMembershipTypeController;
use App\Http\Controllers\Api\Admin\NewsCategoryController as AdminNewsCategoryController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\Admin\ResourceCategoryController as AdminResourceCategoryController;
use App\Http\Controllers\Api\Admin\ResourceController as AdminResourceController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Member\CertificateController;
use App\Http\Controllers\Api\Member\NotificationController;
use App\Http\Controllers\Api\Member\PaymentController;
use App\Http\Controllers\Api\Member\ProfileController;
use App\Http\Controllers\Api\Public\ActionController;
use App\Http\Controllers\Api\Public\DonationController;
use App\Http\Controllers\Api\Public\GalleryController;
use App\Http\Controllers\Api\Public\MembershipTypeController;
use App\Http\Controllers\Api\Public\NewsController;
use App\Http\Controllers\Api\Public\PartnerController;
use App\Http\Controllers\Api\Public\ProjectController;
use App\Http\Controllers\Api\Public\RegionController;
use App\Http\Controllers\Api\Public\ResourceController;
use App\Http\Controllers\Api\Public\SettingController;
use App\Http\Controllers\Api\Public\VerifyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', RegisterController::class)->middleware('throttle:10,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
});

Route::prefix('public')->group(function () {
    Route::get('/members/{memberNumber}/verify', [VerifyController::class, 'show'])->middleware('throttle:30,1');
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/regions', [RegionController::class, 'index']);
    Route::get('/membership-types', [MembershipTypeController::class, 'index']);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);

Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{slug}', [NewsController::class, 'show']);

Route::get('/resources', [ResourceController::class, 'index']);
Route::post('/resources/{resource}/download', [ResourceController::class, 'download']);

Route::get('/actions', [ActionController::class, 'index']);
Route::get('/actions/{slug}', [ActionController::class, 'show']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/partners', [PartnerController::class, 'index']);
Route::post('/partners/contact', [PartnerController::class, 'contact'])->middleware('throttle:10,1');

Route::post('/donations', [DonationController::class, 'store'])->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| Authenticated routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('member')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);

        Route::get('/certificate/pdf', [CertificateController::class, 'pdf'])->name('member.certificate.pdf');

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin / staff routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('role:admin,staff')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/members', [AdminMemberController::class, 'index']);
        Route::post('/members', [AdminMemberController::class, 'store']);
        Route::get('/members/{member}', [AdminMemberController::class, 'show']);
        Route::put('/members/{member}', [AdminMemberController::class, 'update']);
        Route::delete('/members/{member}', [AdminMemberController::class, 'destroy']);
        Route::get('/members/{member}/card/image', [AdminMemberController::class, 'cardImage'])->name('admin.members.card.image');
        Route::get('/members/{member}/card/pdf', [AdminMemberController::class, 'cardPdf'])->name('admin.members.card.pdf');
        Route::get('/members/{member}/certificate/pdf', [AdminMemberController::class, 'certificatePdf'])->name('admin.members.certificate.pdf');
        Route::post('/members/{member}/deliveries/{delivery}/deliver', [AdminMemberController::class, 'deliverMerchandise']);

        Route::get('/memberships/pending', [AdminMembershipController::class, 'pending']);
        Route::post('/memberships/{member}/approve', [AdminMembershipController::class, 'approve']);
        Route::post('/memberships/{member}/reject', [AdminMembershipController::class, 'reject']);

        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::post('/payments/{payment}/mark-paid', [AdminPaymentController::class, 'markPaid']);

        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);

        Route::get('/projects', [AdminProjectController::class, 'index']);
        Route::get('/projects/{project}', [AdminProjectController::class, 'show']);
        Route::post('/projects', [AdminProjectController::class, 'store']);
        Route::put('/projects/{project}', [AdminProjectController::class, 'update']);
        Route::delete('/projects/{project}', [AdminProjectController::class, 'destroy']);
        Route::post('/projects/{project}/images', [AdminProjectController::class, 'storeImage']);
        Route::delete('/projects/{project}/images/{image}', [AdminProjectController::class, 'destroyImage']);
        Route::post('/projects/{project}/updates', [AdminProjectController::class, 'storeUpdate']);
        Route::delete('/projects/{project}/updates/{update}', [AdminProjectController::class, 'destroyUpdate']);

        Route::get('/news', [AdminNewsController::class, 'index']);
        Route::get('/news/{article}', [AdminNewsController::class, 'show']);
        Route::post('/news', [AdminNewsController::class, 'store']);
        Route::put('/news/{article}', [AdminNewsController::class, 'update']);
        Route::delete('/news/{article}', [AdminNewsController::class, 'destroy']);
        Route::get('/news-categories', [AdminNewsCategoryController::class, 'index']);
        Route::post('/news-categories', [AdminNewsCategoryController::class, 'store']);
        Route::delete('/news-categories/{newsCategory}', [AdminNewsCategoryController::class, 'destroy']);

        Route::get('/resources', [AdminResourceController::class, 'index']);
        Route::post('/resources', [AdminResourceController::class, 'store']);
        Route::put('/resources/{resource}', [AdminResourceController::class, 'update']);
        Route::delete('/resources/{resource}', [AdminResourceController::class, 'destroy']);
        Route::get('/resource-categories', [AdminResourceCategoryController::class, 'index']);
        Route::post('/resource-categories', [AdminResourceCategoryController::class, 'store']);
        Route::delete('/resource-categories/{resourceCategory}', [AdminResourceCategoryController::class, 'destroy']);

        Route::get('/partners', [AdminPartnerController::class, 'index']);
        Route::post('/partners', [AdminPartnerController::class, 'store']);
        Route::put('/partners/{partner}', [AdminPartnerController::class, 'update']);
        Route::delete('/partners/{partner}', [AdminPartnerController::class, 'destroy']);

        Route::get('/actions', [AdminActionController::class, 'index']);
        Route::post('/actions', [AdminActionController::class, 'store']);
        Route::put('/actions/{action}', [AdminActionController::class, 'update']);
        Route::delete('/actions/{action}', [AdminActionController::class, 'destroy']);

        Route::get('/intervention-cities', [AdminInterventionCityController::class, 'index']);
        Route::post('/intervention-cities', [AdminInterventionCityController::class, 'store']);
        Route::put('/intervention-cities/{interventionCity}', [AdminInterventionCityController::class, 'update']);
        Route::delete('/intervention-cities/{interventionCity}', [AdminInterventionCityController::class, 'destroy']);

        Route::get('/gallery', [AdminGalleryImageController::class, 'index']);
        Route::post('/gallery', [AdminGalleryImageController::class, 'store']);
        Route::put('/gallery/{galleryImage}', [AdminGalleryImageController::class, 'update']);
        Route::delete('/gallery/{galleryImage}', [AdminGalleryImageController::class, 'destroy']);
    });

    // Paramètres (montants des cotisations, chiffres clés...) : admin uniquement.
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
        Route::post('/settings/upload-image', [AdminSettingController::class, 'uploadImage']);

        Route::get('/membership-types', [AdminMembershipTypeController::class, 'index']);
        Route::post('/membership-types', [AdminMembershipTypeController::class, 'store']);
        Route::put('/membership-types/{membershipType}', [AdminMembershipTypeController::class, 'update']);
        Route::delete('/membership-types/{membershipType}', [AdminMembershipTypeController::class, 'destroy']);
    });
});
