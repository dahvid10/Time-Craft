import { GoogleGenAI, Type } from "@google/genai";
import type { ScheduleItem, ScheduleResponse } from '../types';

// Fix: Updated GoogleGenAI initialization to follow coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTimeBudget(userInput: string, existingSchedule: ScheduleItem[] | null): Promise<ScheduleItem[]> {
  const model = "gemini-2.5-flash";
  const currentDate = new Date().toISOString().split('T')[0];

  const scheduleContext = existingSchedule 
    ? `\nHere is the current schedule that needs to be modified:
      ${JSON.stringify(existingSchedule, null, 2)}`
    : '';

  const mainInstruction = existingSchedule
    ? "Your task is to modify an existing schedule based on the user's new request. Analyze the request and the current schedule, then regenerate the entire schedule object with the necessary adjustments (e.g., adding, removing, or rescheduling tasks)."
    : "Your task is to create a detailed, actionable, and prioritized schedule from scratch based on the user's free-form text input.";

  const prompt = `
    You are an expert time management and productivity coach named Time Craft. 
    ${mainInstruction}
    
    First, carefully analyze the user's input to identify all goals, tasks, deadlines, and their stated priorities (e.g., "high priority", "important"). Also, identify any personal preferences, constraints, or appointments (e.g., "I work best in the mornings", "meetings from 2 PM to 3 PM").
    Finally, identify any potential costs associated with each task. If a specific cost is mentioned (e.g., '$25 ticket', 'about $50'), use that value. If a cost is implied (e.g., 'buy groceries'), provide a reasonable estimate. If no cost is associated, the cost must be 0.

    Today's date is ${currentDate}.
    ${scheduleContext}

    The user's latest input is:
    "${userInput}"

    Based on all this information, generate a structured schedule for the timeline implied by the user's request (e.g., a day, a weekend, a week, a month, or a specific project duration).
    - Infer dates and deadlines from relative terms like "next Friday" or "this Wednesday".
    - Automatically assign a priority level ('High', 'Medium', or 'Low') to each identified task, paying close attention to the user's language. High priority tasks should be scheduled first.
    - Break down larger goals into smaller, manageable sub-tasks. 
    - Be realistic about time allocation and include breaks if appropriate.
    - The schedule should be sorted chronologically by date and then by start time.
    - For each task, provide a unique id (a short random string), a descriptive task name, the specific date in 'YYYY-MM-DD' format, a suggested start time, an end time, an estimated duration, its priority level, a 'completed' status which should always be false, and the estimated cost in USD.

    The output must be a JSON object that adheres to the provided schema.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
        schedule: {
            type: Type.ARRAY,
            description: "A list of scheduled tasks and events.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.STRING,
                        description: "A unique identifier for the task (e.g., 'task-123').",
                    },
                    task: {
                        type: Type.STRING,
                        description: "The specific task to be done.",
                    },
                    date: {
                        type: Type.STRING,
                        description: "The date of the task in YYYY-MM-DD format.",
                    },
                    startTime: {
                        type: Type.STRING,
                        description: "Suggested start time in 'HH:MM AM/PM' format.",
                    },
                    endTime: {
                        type: Type.STRING,
                        description: "Suggested end time in 'HH:MM AM/PM' format.",
                    },
                    duration: {
                        type: Type.STRING,
                        description: "Estimated duration for the task, e.g., '2 hours'.",
                    },
                    priority: {
                        type: Type.STRING,
                        description: "Priority level: 'High', 'Medium', or 'Low'.",
                    },
                    completed: {
                        type: Type.BOOLEAN,
                        description: "Whether the task is completed. Always initialize to false.",
                    },
                    cost: {
                        type: Type.NUMBER,
                        description: "Estimated cost in USD. Defaults to 0 if no cost is associated.",
                    }
                },
                required: ["id", "task", "date", "startTime", "endTime", "duration", "priority", "completed"],
            },
        },
    },
    required: ["schedule"],
  };

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = result.text.trim();
    const parsedResponse: ScheduleResponse = JSON.parse(jsonText);
    
    // Helper function to robustly parse time strings into minutes from midnight
    const timeToMinutes = (timeStr: string): number => {
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return 0; // Default to start of day if format is unexpected
        let [_, hours, minutes, period] = match;
        let h = parseInt(hours, 10);
        if (period.toUpperCase() === 'PM' && h < 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0; // Midnight case
        return h * 60 + parseInt(minutes, 10);
    };

    // Sort the schedule to ensure chronological order, as the model might not always do it perfectly
    return parsedResponse.schedule.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) {
            return dateComparison;
        }
        // If dates are the same, sort by start time
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

  } catch (error) {
    console.error("Error generating time budget:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
}

export async function getOptimizationSuggestions(schedule: ScheduleItem[]): Promise<string> {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert productivity coach named Time Craft.
    Your task is to analyze the following schedule and provide a concise, actionable list of suggestions for how the user could optimize it.

    The current schedule is:
    ${JSON.stringify(schedule, null, 2)}

    Analyze the schedule for potential issues or areas for improvement, such as:
    - Overly packed days with no breaks.
    - High-priority tasks scheduled late in the day when energy might be low.
    - Potential for batching similar tasks together (e.g., running all errands at once).
    - Time-of-day optimization (e.g., suggesting deep work for morning hours).
    - Identifying potential bottlenecks or dependencies between tasks.

    Provide a short, bulleted list of 2-4 concrete suggestions. Frame your advice in a helpful and encouraging tone.
    The output should be formatted as Markdown.
  `;

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error getting optimization suggestions:", error);
    throw new Error("Failed to communicate with the AI model for suggestions.");
  }
}

export async function getPlanSummary(schedule: ScheduleItem[]): Promise<string> {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert project manager and strategic analyst named Time Craft.
    Your task is to analyze the following schedule and provide a high-level summary.

    The current schedule is:
    ${JSON.stringify(schedule, null, 2)}

    Analyze the schedule and generate a summary focusing on three key areas:
    
    1.  **Scope**: What are the main goals, key deliverables, and overall objectives of this plan?
    2.  **Schedule**: What is the overall timeline? What are the key milestones or most critical dates?
    3.  **Efficacy**: What is the general feasibility of this plan? Highlight its strengths (e.g., well-balanced days, clear priorities) and identify potential risks or challenges (e.g., tight deadlines, high costs, lack of breaks).

    Provide a concise summary formatted as Markdown with clear headings for each of the three sections (Scope, Schedule, and Efficacy).
  `;

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error getting plan summary:", error);
    throw new Error("Failed to communicate with the AI model for a summary.");
  }
}