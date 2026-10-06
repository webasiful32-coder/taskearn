import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Coins,
  Clock,
  Users,
  CheckCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Smartphone,
  ClipboardList,
  Share2,
  Database,
  FileText,
  Globe,
  Video,
} from 'lucide-react';
import { Task, PlatformOverview } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface TasksExploreViewProps {
  onSelectTask: (task: Task) => void;
  openCreateTaskModal: () => void;
  openAuthModal: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Jobs', icon: Layers },
  { id: 'APP_TESTING', label: 'App Testing', icon: Smartphone },
  { id: 'SURVEYS', label: 'Surveys', icon: ClipboardList },
  { id: 'SOCIAL_MEDIA', label: 'Social Media', icon: Share2 },
  { id: 'DATA_LABELING', label: 'Data Labeling', icon: Database },
  { id: 'WEBSITE_AUDIT', label: 'Website Audit', icon: Globe },
  { id: 'VIDEO_REVIEW', label: 'Video Testing', icon: Video },
  { id: 'CONTENT_WRITING', label: 'Writing & QA', icon: FileText },
];

export const TasksExploreView: React.FC<TasksExploreViewProps> = ({
  onSelectTask,
  openCreateTaskModal,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformOverview | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
      if (search.trim()) params.search = search.trim();

      const res = await api.getTasks(params);
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.getPlatformStats();
      if (res.success && res.stats) {
        setPlatformStats(res.stats);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section with White & Pink Gradient */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-pink-50/90 to-rose-100/60 border border-pink-200/90 p-8 sm:p-12 shadow-xl shadow-pink-100/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-pink-200 text-pink-700 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Guaranteed Escrow Payouts • Zero Delay</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Complete Micro-Tasks. <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              Earn Real Rewards Instantly.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
            Choose from hundreds of verified micro-jobs including app feedback, data labeling, survey completion, and website audits. All tasks are funded in escrow before release.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
              <span>
                <strong className="text-slate-900 font-black">{platformStats?.activeTasksCount || platformStats?.activeTasks || 12}</strong> Active Tasks Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-pink-600 font-black">★</span>
              <span>
                <strong className="text-slate-900 font-black">${(platformStats?.totalPaidOut || 14850).toLocaleString()}</strong> Disbursed to Earners
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>
                <strong className="text-slate-900 font-black">{platformStats?.totalUsersCount || platformStats?.totalUsers || 540}+</strong> Registered Workers & Creators
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background soft pink gradient flare */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-pink-300/25 to-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Search Bar with White/Pink styling */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-pink-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, keywords, or requirements..."
            className="w-full bg-white border border-pink-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15 shadow-xs transition-all"
          />
        </form>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Difficulty:</span>
          <div className="flex bg-white p-1 rounded-2xl border border-pink-200 shadow-xs">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-sm shadow-pink-500/25'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                {diff === 'ALL' ? 'All Levels' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills with White & Pink Gradient Active States */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
                  : 'bg-white text-slate-700 border border-pink-200 hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700 shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-24 text-center text-pink-600">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-rose-400 rounded-full animate-spin mb-3 shadow-md" />
          <p className="text-xs text-slate-600 font-medium">Loading available micro-tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-pink-200 p-8 space-y-3 shadow-md shadow-pink-100/50">
          <Layers className="w-12 h-12 text-pink-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tasks matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or post a new job for our active worker community.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => {
            const isFull = task.completedSlots >= task.totalSlots;
            const percentage = Math.min(
              100,
              Math.round((task.completedSlots / task.totalSlots) * 100)
            );

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-pink-200/80 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-200/40 transition-all duration-300 cursor-pointer shadow-sm"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      {task.category.replace('_', ' ')}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        task.difficulty === 'EASY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : task.difficulty === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {task.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-pink-600 transition-colors line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                {/* Reward & Progress */}
                <div className="pt-4 mt-4 border-t border-pink-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Task Reward
                      </div>
                      <div className="text-xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                        ${task.rewardAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end font-medium">
                        <Clock className="w-3 h-3 text-pink-500" />
                        <span>~{task.timeEstimateMins} mins</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {task.completedSlots} / {task.totalSlots} Slots
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with White-Pink track and Pink-Rose fill */}
                  <div className="w-full bg-pink-100/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Submission Status or Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    {task.hasSubmitted ? (
                      <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Proof Submitted</span>
                      </span>
                    ) : isFull ? (
                      <span className="text-[11px] font-bold text-slate-400">All Slots Filled</span>
                    ) : (
                      <span className="text-[11px] font-bold text-pink-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>View Requirements</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      By {task.creator?.name || 'Verified Creator'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
