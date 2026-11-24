<?php

namespace App\Http\Controllers;

use App\Models\FacultyProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $faculty = FacultyProfile::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('department', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('faculty/index', [
            'faculty' => $faculty,
            'filters' => ['search' => $search],
        ]);
    }
}