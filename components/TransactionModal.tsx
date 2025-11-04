import React, { useState } from 'react';
import type { Plan, Transaction } from '../types';
import { XIcon } from './icons/XIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface TransactionModalProps {
  plan: Plan;
  type: 'expense' | 'credit';
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const TransactionModal: React.FC<TransactionModalProps> = ({ plan, type, onClose, onSave }) => {
    const [transactionType, setTransactionType] = useState<'expense' | 'credit'>(type);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setReceipt(file);
                setError('');
            } else {
                setError('Only PDF files are accepted for receipts.');
                setReceipt(null);
            }
        }
    };

    const handleSave = async () => {
        if (!description.trim()) {
            setError('Please enter a description.');
            return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid, positive amount.');
            return;
        }
        setError('');
        setIsProcessing(true);

        let receiptData;
        if (receipt) {
            try {
                const base64 = await fileToBase64(receipt);
                receiptData = {
                    name: receipt.name,
                    type: receipt.type,
                    data: base64,
                };
            } catch (err) {
                setError('Failed to process the receipt file. Please try again.');
                setIsProcessing(false);
                return;
            }
        }

        onSave({
            description: description.trim(),
            amount: numericAmount,
            type: transactionType,
            receipt: receiptData,
        });
        setIsProcessing(false);
    };

    const modalTitle = transactionType === 'expense' ? 'Add Expense' : 'Add Credit';

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md relative animate-fade-in-down flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                >
                    <XIcon />
                </button>

                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{modalTitle}</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">For plan: {plan.name}</p>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Transaction Type */}
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Transaction Type</legend>
                        <div className="flex gap-4">
                           <div className="flex items-center">
                                <input id="type-expense" name="transaction-type" type="radio" checked={transactionType === 'expense'} onChange={() => setTransactionType('expense')} className="h-4 w-4 text-red-600 border-gray-300 dark:border-slate-600 focus:ring-red-500" />
                                <label htmlFor="type-expense" className="ml-3 block text-sm font-medium text-gray-700 dark:text-slate-300">Expense</label>
                            </div>
                            <div className="flex items-center">
                                <input id="type-credit" name="transaction-type" type="radio" checked={transactionType === 'credit'} onChange={() => setTransactionType('credit')} className="h-4 w-4 text-green-600 border-gray-300 dark:border-slate-600 focus:ring-green-500" />
                                <label htmlFor="type-credit" className="ml-3 block text-sm font-medium text-gray-700 dark:text-slate-300">Credit</label>
                            </div>
                        </div>
                    </fieldset>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Description <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-md p-2 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="e.g., Team Lunch, Software Subscription"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Amount <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-400 dark:text-slate-400 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-md p-2 pl-7 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    
                    {/* Receipt Upload */}
                    <div>
                         <label htmlFor="receipt-upload" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Receipt (PDF only)</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                                <div className="flex text-sm text-gray-600 dark:text-slate-400">
                                    <label htmlFor="receipt-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="receipt-upload" name="receipt-upload" type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {receipt ? 
                                    <p className="text-sm text-green-500">{receipt.name}</p> :
                                    <p className="text-xs text-gray-500 dark:text-slate-500">PDF up to 10MB</p>
                                }
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-100 font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center disabled:opacity-50"
                    >
                         {isProcessing && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        Save Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};