export interface ScheduleItem {
  id: string;
  task: string;
  date: string; // e.g., "2024-07-28"
  startTime: string;
  endTime: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  completed: boolean;
  cost: number; // Estimated cost in USD
  planId?: string; // To associate with a saved plan
}

export interface ScheduleResponse {
    schedule: ScheduleItem[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'credit';
  date: string; // ISO string
  receipt?: {
    name: string;
    type: string; // 'application/pdf'
    data: string; // base64
  };
}

export interface Plan {
  id: string;
  name: string;
  userInput: string;
  schedule: ScheduleItem[];
  createdAt: string;
  budget?: number; // Optional budget for the plan
  transactions?: Transaction[];
}

// Fix: Added missing Goal interface.
export interface Goal {
  id: string;
  description: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
}