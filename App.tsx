import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { generateTimeBudget, getOptimizationSuggestions, getPlanSummary } from './services/geminiService';
import { getSavedPlans, savePlan, deletePlan as removePlan, updatePlan } from './services/planService';
import type { ScheduleItem, Plan, Transaction } from './types';
import { SavedPlans } from './components/SavedPlans';
import { OptimizationModal } from './components/OptimizationModal';
import { SummaryModal } from './components/SummaryModal';
import { PlannerIcon } from './components/icons/PlannerIcon';
import { ScheduleIcon } from './components/icons/ScheduleIcon';
import { BudgetTracker } from './components/BudgetTracker';
import { BudgetIcon } from './components/icons/BudgetIcon';
import { ExpenseManager } from './components/ExpenseManager';
import { SavePlanModal } from './components/SavePlanModal';
import { EditPlanModal } from './components/EditPlanModal';
import { TransactionModal } from './components/TransactionModal';
import { TaskDetailModal } from './components/TaskDetailModal';

// Fix: Refactored TabButton to use a named interface for props to resolve a type inference issue.
interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Fix: Explicitly type TabButton as a React.FC to resolve a type inference issue with the children prop.
const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
    const baseClasses = "flex items-center gap-2 px-6 py-3 text-lg font-bold transition-colors duration-200 border-b-2";
    const activeClasses = "border-sky-400 text-sky-400";
    const inactiveClasses = "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-500 dark:hover:border-slate-400";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    )
};


export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [userInput, setUserInput] = useState<string>('Plan my project launch for next month. Key deadlines are: final code commit by the 15th (high priority), user documentation by the 22nd, and a marketing campaign that starts on the 25th. The campaign will cost about $500. I also have a recurring team sync every Monday at 10 AM.');
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [previewPlanIds, setPreviewPlanIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'planner' | 'schedule' | 'budget'>('planner');

  // Notification State
  const [currentNotification, setCurrentNotification] = useState<ScheduleItem | null>(null);
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());

  // Modal States
  const [showOptimizationModal, setShowOptimizationModal] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ScheduleItem | null>(null);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [transactionModalState, setTransactionModalState] = useState<{isOpen: boolean, plan: Plan | null, type: 'expense' | 'credit'}>({isOpen: false, plan: null, type: 'expense'});

  // Load plans from localStorage on initial render
  useEffect(() => {
    setSavedPlans(getSavedPlans());
  }, []);

  const scheduleForDisplay = useMemo((): ScheduleItem[] | null => {
    if (previewPlanIds.size > 0) {
        const plansToPreview = savedPlans.filter(p => previewPlanIds.has(p.id));
        return plansToPreview.flatMap(p => p.schedule);
    }
    return currentSchedule;
  }, [previewPlanIds, savedPlans, currentSchedule]);
  
  const plansForPreview = useMemo(() => {
    return savedPlans.filter(p => previewPlanIds.has(p.id));
  }, [previewPlanIds, savedPlans]);

  // Effect for checking upcoming tasks
  useEffect(() => {
    if (previewPlanIds.size > 0 || !scheduleForDisplay) {
      setCurrentNotification(null);
      return;
    }

    const checkUpcomingTasks = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      for (const task of scheduleForDisplay) {
        if (task.completed || notifiedTaskIds.has(task.id)) {
          continue;
        }

        const taskStartTimeStr = `${task.date}T${new Date(`1970-01-01 ${task.startTime}`).toTimeString().split(' ')[0]}`;
        const taskStartTime = new Date(taskStartTimeStr);

        if (taskStartTime > now && taskStartTime <= fifteenMinutesFromNow) {
          if (!currentNotification) {
            setCurrentNotification(task);
            break; 
          }
        }
      }
    };

    const intervalId = setInterval(checkUpcomingTasks, 60000); // Check every minute
    checkUpcomingTasks(); // Initial check

    return () => clearInterval(intervalId);
  }, [scheduleForDisplay, notifiedTaskIds, currentNotification, previewPlanIds.size]);


  const handleScheduleUpdate = async () => {
    if (!userInput.trim()) {
        setError('Please describe your goals or desired changes.');
        return;
    }
    setIsLoading(true);
    setError(null);
    
    // If it's a new plan, clear old state, but keep previewed plans
    if (!activePlanId) {
      setCurrentSchedule(null);
    }

    try {
      // Pass current schedule for context-aware updates
      const generatedSchedule = await generateTimeBudget(userInput, currentSchedule);
      const scheduleWithCompletion = generatedSchedule.map(item => ({ ...item, completed: false, cost: item.cost || 0 }));
      setCurrentSchedule(scheduleWithCompletion);
      setActiveTab('schedule');
    } catch (e) {
      console.error(e);
      setError('Failed to generate or update the schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetOptimizations = async () => {
    if (!scheduleForDisplay) return;
    setIsOptimizing(true);
    setOptimizationSuggestions(null);
    setShowOptimizationModal(true);
    try {
        const suggestions = await getOptimizationSuggestions(scheduleForDisplay);
        setOptimizationSuggestions(suggestions);
    } catch (e) {
        console.error(e);
        setOptimizationSuggestions("Sorry, I couldn't get optimization suggestions at this time. Please try again.");
    } finally {
        setIsOptimizing(false);
    }
  };

  const handleGetSummary = async () => {
    if (!scheduleForDisplay) return;
    setIsSummarizing(true);
    setPlanSummary(null);
    setShowSummaryModal(true);
    try {
        const summary = await getPlanSummary(scheduleForDisplay);
        setPlanSummary(summary);
    } catch (e) {
        console.error(e);
        setPlanSummary("Sorry, I couldn't generate a summary at this time. Please try again.");
    } finally {
        setIsSummarizing(false);
    }
  };


  const handleSaveOrUpdatePlan = () => {
    if (!currentSchedule) return;

    if (activePlanId) {
        // Update existing plan
        const planToUpdate = savedPlans.find(p => p.id === activePlanId);
        if (planToUpdate) {
            const updatedPlan = {
                ...planToUpdate,
                userInput,
                schedule: currentSchedule.map(item => ({ ...item, planId: activePlanId }))
            };
            updatePlan(updatedPlan);
            setSavedPlans(getSavedPlans());
            alert(`Plan "${updatedPlan.name}" has been updated.`);
        }
    } else {
        // Open modal to save a new plan
        setShowSaveModal(true);
    }
  };
  
  const handleConfirmSavePlan = ({ planName, budget }: { planName: string; budget?: number }) => {
    if (!currentSchedule || !planName) {
        setShowSaveModal(false);
        return;
    }
    const planId = `plan-${Date.now()}`;
    const newPlan: Plan = {
        id: planId,
        name: planName,
        userInput,
        schedule: currentSchedule.map(item => ({ ...item, planId: planId })),
        createdAt: new Date().toISOString(),
        budget,
        transactions: [],
    };
    savePlan(newPlan);
    setSavedPlans(getSavedPlans());
    setActivePlanId(newPlan.id);
    setShowSaveModal(false);
    alert(`Plan "${planName}" saved successfully! You can now manage its budget.`);
    setActiveTab('budget');
  };
  
  const handleLoadPlan = (planId: string) => {
      const plan = savedPlans.find(p => p.id === planId);
      if (plan) {
        setUserInput(plan.userInput);
        setCurrentSchedule(plan.schedule);
        setActivePlanId(plan.id);
        setPreviewPlanIds(new Set());
        setCurrentNotification(null);
        setNotifiedTaskIds(new Set());
        setActiveTab('schedule');
      }
  };

  const handleDeletePlan = (planId: string) => {
      if (window.confirm("Are you sure you want to delete this plan?")) {
        removePlan(planId);
        const updatedPlans = getSavedPlans();
        setSavedPlans(updatedPlans);
        if (activePlanId === planId) {
            setCurrentSchedule(null);
            setActivePlanId(null);
            setUserInput('');
        }
        if (previewPlanIds.has(planId)) {
            setPreviewPlanIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(planId);
                return newSet;
            });
        }
      }
  };

  const handleEditPlan = (planId: string) => {
    const plan = savedPlans.find(p => p.id === planId);
    if (plan) {
      setPlanToEdit(plan);
      setShowEditModal(true);
    }
  };

  const handleConfirmEditPlan = (details: { planName: string, budget?: number }) => {
    if (!planToEdit) return;

    const updatedPlan: Plan = {
      ...planToEdit,
      name: details.planName,
      budget: details.budget,
    };

    updatePlan(updatedPlan);
    setSavedPlans(getSavedPlans());
    setShowEditModal(false);
    setPlanToEdit(null);
  };
  
  const handleOpenTransactionModal = (plan: Plan, type: 'expense' | 'credit') => {
    setTransactionModalState({ isOpen: true, plan, type });
  };

  const handleCloseTransactionModal = () => {
      setTransactionModalState({ isOpen: false, plan: null, type: 'expense' });
  };

  const handleSaveTransaction = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const { plan } = transactionModalState;
    if (!plan) return;

    const transactionWithId: Transaction = {
        ...newTransaction,
        id: `txn-${Date.now()}`,
        date: new Date().toISOString(),
    };

    const updatedPlan: Plan = {
        ...plan,
        transactions: [...(plan.transactions || []), transactionWithId],
    };

    updatePlan(updatedPlan);
    setSavedPlans(getSavedPlans());
    handleCloseTransactionModal();
};


  const handleTogglePreview = (planId: string) => {
    setPreviewPlanIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(planId)) {
            newSet.delete(planId);
        } else {
            newSet.add(planId);
        }
        return newSet;
    });
    setActiveTab('schedule');
  };

  const handleToggleTask = (taskId: string) => {
    const task = scheduleForDisplay?.find(t => t.id === taskId);
    if (!task) return;

    // Handle toggling for saved plans
    if (task.planId) {
        const planToUpdate = savedPlans.find(p => p.id === task.planId);
        if (planToUpdate) {
            const updatedSchedule = planToUpdate.schedule.map(t => 
                t.id === taskId ? { ...t, completed: !t.completed } : t
            );
            const updatedPlan = { ...planToUpdate, schedule: updatedSchedule };
            updatePlan(updatedPlan);
            setSavedPlans(getSavedPlans());
            // also update current schedule if it's the active plan
            if (activePlanId === task.planId) {
              setCurrentSchedule(updatedSchedule);
            }
        }
    } else if (currentSchedule) {
        // Handle toggling for the current, unsaved schedule
        const updatedSchedule = currentSchedule.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setCurrentSchedule(updatedSchedule);
    }
  };

  const handleDismissNotification = () => {
    if (currentNotification) {
      setNotifiedTaskIds(prev => new Set(prev).add(currentNotification.id));
      setCurrentNotification(null);
    }
  };

  const handleSelectTask = (task: ScheduleItem) => {
    setSelectedTask(task);
  };


  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8">
        
        <div className="mb-8 flex justify-center border-b border-gray-200 dark:border-slate-700">
            <TabButton isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')}>
                <PlannerIcon /> Planner
            </TabButton>
            <TabButton isActive={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
                <ScheduleIcon /> Schedule
            </TabButton>
             <TabButton isActive={activeTab === 'budget'} onClick={() => setActiveTab('budget')}>
                <BudgetIcon /> Budget
            </TabButton>
        </div>
        
        <div>
            {activeTab === 'planner' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <SavedPlans 
                            plans={savedPlans}
                            onLoad={handleLoadPlan}
                            onDelete={handleDeletePlan}
                            onEdit={handleEditPlan}
                            onTogglePreview={handleTogglePreview}
                            activePlanId={activePlanId}
                            previewPlanIds={previewPlanIds}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Create or Update Plan</h2>
                        <ChatInterface
                            userInput={userInput}
                            setUserInput={setUserInput}
                            onUpdate={handleScheduleUpdate}
                            isLoading={isLoading}
                            onSuggest={handleGetOptimizations}
                            isSuggesting={isOptimizing}
                            onSummarize={handleGetSummary}
                            isSummarizing={isSummarizing}
                            hasSchedule={!!currentSchedule}
                            onSavePlan={handleSaveOrUpdatePlan}
                            activePlanId={activePlanId}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400">
                            {previewPlanIds.size > 0 ? 'Plan Preview' : (activePlanId ? savedPlans.find(p=>p.id === activePlanId)?.name : 'Your Generated Schedule')}
                        </h2>
                    </div>
                    <ScheduleDisplay 
                    schedule={scheduleForDisplay} 
                    isLoading={isLoading} 
                    error={error} 
                    onToggleTask={handleToggleTask}
                    upcomingTask={currentNotification} 
                    onDismissNotification={handleDismissNotification}
                    plans={savedPlans}
                    isPreviewing={previewPlanIds.size > 0}
                    onSelectTask={handleSelectTask}
                    />
                </div>
            )}
            
            {activeTab === 'budget' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="lg:col-span-1">
                        <BudgetTracker plans={plansForPreview.length > 0 ? plansForPreview : savedPlans} />
                    </div>
                    <div className="lg:col-span-2">
                        <ExpenseManager plans={savedPlans} onAddTransaction={handleOpenTransactionModal} />
                    </div>
                </div>
            )}

        </div>

      </main>
      {showOptimizationModal && (
        <OptimizationModal
          suggestions={optimizationSuggestions}
          isLoading={isOptimizing}
          onClose={() => setShowOptimizationModal(false)}
        />
      )}
       {showSummaryModal && (
        <SummaryModal
          summary={planSummary}
          isLoading={isSummarizing}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
      {showSaveModal && (
        <SavePlanModal 
            onClose={() => setShowSaveModal(false)}
            onSave={handleConfirmSavePlan}
        />
      )}
      {showEditModal && planToEdit && (
        <EditPlanModal
            plan={planToEdit}
            onClose={() => {
                setShowEditModal(false);
                setPlanToEdit(null);
            }}
            onSave={handleConfirmEditPlan}
        />
      )}
      {transactionModalState.isOpen && transactionModalState.plan && (
        <TransactionModal
            plan={transactionModalState.plan}
            type={transactionModalState.type}
            onClose={handleCloseTransactionModal}
            onSave={handleSaveTransaction}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
            task={selectedTask}
            planName={selectedTask.planId ? savedPlans.find(p => p.id === selectedTask.planId)?.name || null : 'Unsaved Plan'}
            onClose={() => setSelectedTask(null)}
            onToggleTask={handleToggleTask}
        />
      )}
    </div>
  );
}