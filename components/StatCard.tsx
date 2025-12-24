
import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  trend, 
  colorClass,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-white/20 transition-all cursor-default group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</h3>
        <p className="text-2xl font-bold text-slate-100 tracking-tight group-hover:text-indigo-400 transition-colors">{value}</p>
      </div>
    </motion.div>
  );
};
