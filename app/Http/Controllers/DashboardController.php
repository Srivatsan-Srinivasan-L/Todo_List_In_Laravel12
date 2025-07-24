<?php


namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Inertia\Inertia;

class DashboardController extends Controller
{
public function index()
{
    $user = auth()->user();


    $totalLists = TaskList::where('user_id', $user->id)->count();

    $tasksQuery = Task::whereHas('list', fn($q) => $q->where('user_id', $user->id));

    $totalTasks = (clone $tasksQuery)->count();
    $completedTasks = (clone $tasksQuery)->where('is_completed', true)->count();
    $pendingTasks = (clone $tasksQuery)->where('is_completed', false)->count();

    $stats = [
        'totalLists' => $totalLists,
        'totalTasks' => $totalTasks,
        'completedTasks' => $completedTasks,
        'pendingTasks' => $pendingTasks,
    ];

    return Inertia::render('Dashboard', [
        'stats' => $stats,
    ]);
}



}
