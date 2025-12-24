
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, History } from 'lucide-react';
import { Expense } from '../types';
import { CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/dateUtils';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  return (
    <div className="glass-card rounded-3xl shadow-sm overflow-hidden h-full flex flex-col border border-white/5">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" /> Ledger
        </h2>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-[0.1em]">
          {expenses.length} entries
        </span>
      </div>
      <div className="overflow-y-auto max-h-[500px] p-4 space-y-3 custom-scrollbar bg-slate-900/10">
        <AnimatePresence initial={false}>
          {expenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-slate-600"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                <Trash2 className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Database Empty</p>
            </motion.div>
          ) : (
            expenses.slice().reverse().map((expense) => {
              const categoryInfo = CATEGORIES.find(c => c.value === expense.category);
              return (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-white/5 group hover:border-indigo-500/30 hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20"
                      style={{ backgroundColor: `${categoryInfo?.color}CC` || '#334155' }}
                    >
                      {categoryInfo?.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm tracking-tight">{expense.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {expense.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-100 text-sm">
                      -{formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
