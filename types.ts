
export enum Category {
  FOOD = 'Food',
  TRAVEL = 'Travel',
  RENT = 'Rent',
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment',
  MISC = 'Misc'
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // ISO string
}

export interface BudgetConfig {
  monthlyLimit: number;
  currency: string;
}

export interface MonthlyStats {
  totalSpent: number;
  remaining: number;
  dailyAverage: number;
  expectedSpendTillToday: number;
  runwayDays: number;
  isOverspending: boolean;
  currentDay: number;
  totalDaysInMonth: number;
  monthName: string;
}
