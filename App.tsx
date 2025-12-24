
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { Expense, BudgetConfig, MonthlyStats } from './types';
import { 
  LOCAL_STORAGE_EXPENSES_KEY, 
  LOCAL_STORAGE_BUDGET_KEY, 
  INITIAL_BUDGET 
} from './constants';
import { getMonthInfo, formatCurrency } from './utils/dateUtils';
import { StatCard } from './components/StatCard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load expenses", e);
      return [];
    }
  });

  const [budget, setBudget] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);
      if (!saved) return { monthlyLimit: INITIAL_BUDGET, currency: 'USD' };
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed.monthlyLimit === 'number' 
        ? parsed 
        : { monthlyLimit: INITIAL_BUDGET, currency: 'USD' };
    } catch (e) {
      return { monthlyLimit: INITIAL_BUDGET, currency: 'USD' };
    }
  });

  const [viewDate, setViewDate] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.monthlyLimit.toString());

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_BUDGET_KEY, JSON.stringify(budget));
  }, [budget]);

  const stats = useMemo((): MonthlyStats => {
    const { totalDaysInMonth, daysToCalculateAvg, monthName, year, month, isCurrentMonth } = getMonthInfo(viewDate);
    
    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const limit = budget.monthlyLimit || 1;
    const remaining = Math.max(0, budget.monthlyLimit - totalSpent);
    
    const dailyAverage = daysToCalculateAvg > 0 ? totalSpent / daysToCalculateAvg : 0;
    const dailyBudgeted = budget.monthlyLimit / (totalDaysInMonth || 1);
    const expectedSpendTillToday = dailyBudgeted * daysToCalculateAvg;
    
    let runwayDays = 0;
    if (isCurrentMonth) {
      if (totalSpent === 0) {
        runwayDays = totalDaysInMonth - daysToCalculateAvg;
      } else if (dailyAverage > 0) {
        runwayDays = Math.min(365, remaining / dailyAverage);
      } else {
        runwayDays = totalDaysInMonth - daysToCalculateAvg;
      }
    } else {
      runwayDays = 0;
    }
    
    const isOverspending = totalSpent > (expectedSpendTillToday + 0.01);

    return {
      totalSpent,
      remaining,
      dailyAverage,
      expectedSpendTillToday,
      runwayDays,
      isOverspending,
      currentDay: daysToCalculateAvg,
      totalDaysInMonth,
      monthName
    };
  }, [expenses, budget, viewDate]);

  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'date'>) => {
    const fallbackId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expense: Expense = {
      ...newExp,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackId,
      date: new Date().toISOString()
    };
    setExpenses(prev => [...prev, expense]);
    setViewDate(new Date());
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const changeMonth = (offset: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const updateBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val >= 0) {
      setBudget(prev => ({ ...prev, monthlyLimit: val }));
      setIsSettingsOpen(false);
    }
  };

  const activeMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth();
  });

  return (
    <div className="min-h-screen pb-12 selection:bg-indigo-500/30 selection:text-indigo-200 bg-slate-950 text-slate-100 antialiased">
      <nav className="sticky top-0 z-50 glass-card border-b border-white/5 mb-8 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setViewDate(new Date())}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">EduSpend <span className="text-indigo-400 font-medium">Pro</span></h1>
          </motion.div>

          <div className="flex items-center gap-1 md:gap-4 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition-all"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 md:px-6 py-1 text-center min-w-[120px] md:min-w-[180px]">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block leading-none mb-1">Time Horizon</span>
              <span className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                {stats.monthName} {viewDate.getFullYear()}
              </span>
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition-all"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setTempBudget(budget.monthlyLimit.toString());
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${isSettingsOpen ? 'bg-indigo-600 text-white shadow-indigo-900/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700'}`}
            >
              <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Edit Goal</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 space-y-8 relative">
        <AnimatePresence>
          {isSettingsOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-[6px] z-40"
                onClick={() => setIsSettingsOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-card p-8 rounded-[2.5rem] shadow-2xl border border-white/10 absolute right-4 top-0 z-50 w-full max-w-sm space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold uppercase tracking-widest text-indigo-400">Budget Config</h4>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">Adjust your target monthly limit. Metrics are updated instantly.</p>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Monthly Target ($)</label>
                    <input 
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateBudget()}
                      className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-xl font-bold text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={updateBudget}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
                  >
                    Confirm Configuration
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={() => {
                      if(confirm("DANGER: This will permanently delete your entire spending history. Continue?")) {
                        setExpenses([]);
                        setBudget({ monthlyLimit: INITIAL_BUDGET, currency: 'USD' });
                        setIsSettingsOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Factory Reset History
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key={viewDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label={`${stats.monthName} Spent`}
                value={formatCurrency(stats.totalSpent)}
                icon={<Wallet className="w-5 h-5" />}
                colorClass="bg-indigo-600"
                delay={0}
              />
              <StatCard 
                label="Residual Funds"
                value={formatCurrency(stats.remaining)}
                icon={<TrendingUp className="w-5 h-5" />}
                colorClass="bg-emerald-600"
                trend={{ 
                  value: `${Math.round((stats.remaining / (budget.monthlyLimit || 1)) * 100)}% left`, 
                  isPositive: true 
                }}
                delay={0.1}
              />
              <StatCard 
                label="Daily Burn Rate"
                value={formatCurrency(stats.dailyAverage)}
                icon={<BarChart3 className="w-5 h-5" />}
                colorClass="bg-amber-600"
                delay={0.2}
              />
              <StatCard 
                label="Cash Runway"
                value={stats.runwayDays === 0 ? "N/A" : `${Math.round(stats.runwayDays)} Days`}
                icon={<Calendar className="w-5 h-5" />}
                colorClass="bg-slate-700"
                trend={{ 
                  value: stats.isOverspending ? 'Exceeded' : 'Stable', 
                  isPositive: !stats.isOverspending 
                }}
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-8">
                <ExpenseForm onAddExpense={handleAddExpense} />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-3xl shadow-sm border ${stats.isOverspending ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`p-3 rounded-2xl ${stats.isOverspending ? 'bg-red-500 text-white' : 'bg-green-600 text-white shadow-lg shadow-green-900/20'}`}>
                      {stats.isOverspending ? <AlertCircle className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`font-bold uppercase text-[10px] tracking-widest ${stats.isOverspending ? 'text-red-300' : 'text-green-300'}`}>
                        {stats.isOverspending ? 'Health Warning' : 'Financial Efficiency'}
                      </h3>
                      <p className={`text-sm mt-1 leading-relaxed ${stats.isOverspending ? 'text-red-200/60' : 'text-green-200/60'}`}>
                        {stats.isOverspending 
                          ? `You are ${formatCurrency(stats.totalSpent - stats.expectedSpendTillToday)} above your projected cap for this cycle.`
                          : `Positive divergence: spending is ${formatCurrency(stats.expectedSpendTillToday - stats.totalSpent)} below threshold.`}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <ExpenseList expenses={activeMonthExpenses} onDelete={handleDeleteExpense} />
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="glass-card p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
                  <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
                  <div className="z-10 text-center md:text-left">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">{stats.monthName} Global Goal</p>
                    <h2 className="text-5xl font-extrabold mb-4 tracking-tighter text-white">
                      {formatCurrency(budget.monthlyLimit)}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2 bg-slate-900/80 border border-white/5 px-3 py-2 rounded-xl text-slate-300">
                        <Calendar className="w-3.5 h-3.5" /> 
                        Observation Period: {stats.currentDay} / {stats.totalDaysInMonth}
                      </span>
                    </div>
                  </div>
                  <div className="z-10 flex-1 max-w-sm w-full space-y-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Resource Consumption</span>
                      <span className={`text-sm font-bold ${stats.isOverspending ? 'text-red-400' : 'text-indigo-400'}`}>
                        {Math.round((stats.totalSpent / (budget.monthlyLimit || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="h-5 bg-slate-800/80 rounded-full overflow-hidden p-1 shadow-inner relative border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stats.totalSpent / (budget.monthlyLimit || 1)) * 100)}%` }}
                        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                        className={`h-full rounded-full shadow-lg relative ${stats.isOverspending ? 'bg-gradient-to-r from-red-500 to-red-700' : 'bg-gradient-to-r from-indigo-500 to-violet-600'}`}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-extrabold text-slate-600 px-1">
                      <span>Baseline</span>
                      <span>Target Ceiling</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold">{stats.monthName} Performance</h2>
                  </div>
                </div>
                
                <AnalyticsDashboard expenses={activeMonthExpenses} viewDate={viewDate} />

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="glass-card p-10 rounded-[2.5rem] bg-indigo-950/40 border-indigo-500/10 text-white shadow-2xl overflow-hidden relative"
                >
                  <div className="absolute right-0 top-0 w-1/3 h-full bg-indigo-800/5 skew-x-12 transform translate-x-10"></div>
                  <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2">
                      <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">Financial Projections</h3>
                      <h4 className="text-3xl font-extrabold mb-5 tracking-tight leading-tight">
                        {stats.totalSpent === 0 
                          ? `New cycle: ${stats.monthName}. Data pending entry.` 
                          : `Projected capital depletion: ${new Date(viewDate.getFullYear(), viewDate.getMonth(), stats.currentDay + stats.runwayDays).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.`
                        }
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-lg mb-0 font-medium italic">
                        *Statistical estimation based on current velocity variance.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40">
                        Monthly Report <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-white/5 pt-12 text-center pb-8 px-4 opacity-50">
        <div className="max-w-xl mx-auto">
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase mb-4">EduSpend Intelligence</p>
          <p className="text-slate-600 text-xs leading-relaxed">
            Autonomous client-side analyzer for modern academic environments.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
