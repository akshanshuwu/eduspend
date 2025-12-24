
import React from 'react';
import { 
  Pizza, 
  Plane, 
  Home, 
  BookOpen, 
  Tv, 
  MoreHorizontal,
  Wallet,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES = [
  { value: Category.FOOD, icon: <Pizza className="w-4 h-4" />, color: '#ef4444' },
  { value: Category.TRAVEL, icon: <Plane className="w-4 h-4" />, color: '#3b82f6' },
  { value: Category.RENT, icon: <Home className="w-4 h-4" />, color: '#10b981' },
  { value: Category.EDUCATION, icon: <BookOpen className="w-4 h-4" />, color: '#8b5cf6' },
  { value: Category.ENTERTAINMENT, icon: <Tv className="w-4 h-4" />, color: '#f59e0b' },
  { value: Category.MISC, icon: <MoreHorizontal className="w-4 h-4" />, color: '#64748b' },
];

export const INITIAL_BUDGET = 1000;
export const LOCAL_STORAGE_EXPENSES_KEY = 'eduspend_expenses';
export const LOCAL_STORAGE_BUDGET_KEY = 'eduspend_budget';

export const ICONS = {
  Wallet,
  TrendingUp,
  AlertCircle,
  Calendar
};
