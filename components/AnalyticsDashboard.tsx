
import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { Expense } from '../types';
import { CATEGORIES, INITIAL_BUDGET, LOCAL_STORAGE_BUDGET_KEY } from '../constants';
import { formatCurrency, getMonthInfo } from '../utils/dateUtils';

interface AnalyticsDashboardProps {
  expenses: Expense[];
  viewDate: Date;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ expenses, viewDate }) => {
  const { totalDaysInMonth } = getMonthInfo(viewDate);

  const budgetLimit = useMemo(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);
      if (!saved) return INITIAL_BUDGET;
      const parsed = JSON.parse(saved);
      return typeof parsed?.monthlyLimit === 'number' ? parsed.monthlyLimit : INITIAL_BUDGET;
    } catch {
      return INITIAL_BUDGET;
    }
  }, []);

  const dailyBudgetGoal = budgetLimit / (totalDaysInMonth || 1);

  const categoryData = CATEGORIES.map(cat => {
    const value = expenses
      .filter(e => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.value, value, color: cat.color };
  }).filter(d => d.value > 0);

  const dailyData = Array.from({ length: totalDaysInMonth || 30 }, (_, i) => {
    const day = i + 1;
    const amount = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getDate() === day;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    return { day, amount };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-3 border border-white/10 rounded-xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">
            {typeof label === 'number' ? `Cycle Day ${label}` : label}
          </p>
          <p className="text-sm font-bold text-indigo-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-3xl shadow-sm min-h-[380px] flex flex-col border border-white/5"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Capital Allocation</h3>
          <div className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded tracking-widest">SECTOR VIEW</div>
        </div>
        
        {categoryData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
            <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-slate-800 mb-4 animate-pulse"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest">No sector activity</p>
          </div>
        ) : (
          <div className="h-[280px] w-full flex flex-col sm:flex-row items-center justify-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={viewDate.toISOString()}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`${entry.color}CC`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 ml-4 py-4 pr-4 border-l border-white/5 pl-6 min-w-[120px]">
              {categoryData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-lg shadow-black/40" style={{ backgroundColor: d.color }} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight leading-none mb-1">{d.name}</span>
                    <span className="text-xs font-bold text-slate-200">{formatCurrency(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-3xl shadow-sm min-h-[380px] flex flex-col border border-white/5"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Velocity Pulse</h3>
          <div className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded tracking-widest uppercase">Target: {formatCurrency(dailyBudgetGoal)}</div>
        </div>
        
        <div className="flex-1 h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={viewDate.toISOString()} data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#475569', fontWeight: 700}} 
                dy={15}
                interval={Math.floor(totalDaysInMonth / 10)}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#475569', fontWeight: 700}} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={dailyBudgetGoal} 
                stroke="#334155" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ value: 'TARGET', position: 'insideRight', fill: '#475569', fontSize: 7, fontWeight: 900, dy: -8 }} 
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
