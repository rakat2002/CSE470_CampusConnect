<?php

namespace App\Http\Controllers;

use App\Models\TransportRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportRouteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $routes = TransportRoute::with('stops')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('route_name', 'like', "%{$search}%")
                      ->orWhereHas('stops', fn ($s) => $s->where('stop_name', 'like', "%{$search}%"));
                });
            })
            ->get();

        return Inertia::render('transport/index', [
            'routes' => $routes,
            'filters' => ['search' => $search],
        ]);
    }
}