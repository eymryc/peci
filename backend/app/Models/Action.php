<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'category', 'description', 'image_path', 'icon', 'order'])]
class Action extends Model
{
    //
}
