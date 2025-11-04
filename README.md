# Time Craft: AI-Powered Schedule & Budget Planner

Time Craft is an intelligent time management and budgeting assistant designed to help you craft the perfect schedule. Leveraging the power of Google's Gemini API, it transforms your goals, deadlines, and ideas into actionable, organized, and optimized plans.

## Key Features

*   **AI-Powered Scheduling**: Describe your goals in natural language, and Time Craft's AI will generate a detailed, prioritized schedule for you. It can also intelligently update and modify existing plans based on new requests.
*   **Comprehensive Budgeting**: Set a budget for your plans and track your spending with an intuitive interface. The app visualizes your financial health, showing you how much you've spent and what's remaining.
*   **Detailed Transaction Management**: Log expenses and credits with detailed descriptions and amounts. You can even upload PDF receipts to keep your financial records organized and accurate.
*   **Plan Management**: Save multiple plans, load them for reference, or preview them side-by-side to compare different schedules.
*   **Schedule Visualization**: View your schedule in a simple list format or a dynamic, multi-day timeline view for a better understanding of your week.
*   **AI Optimizations & Summaries**: Get AI-driven suggestions to optimize your schedule for efficiency and generate high-level summaries of your plans to understand scope, timelines, and potential risks.
*   **Light & Dark Modes**: A sleek, user-friendly interface with toggleable light and dark themes for your viewing comfort.

## Tech Stack

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)

## Getting Started

This application is designed to run in a web-based development environment.

1.  Ensure you have a valid API key for the Gemini API set in your environment variables (`process.env.API_KEY`).
2.  The application will automatically build and run.

## Future Enhancements

This project has a solid foundation, but there are several exciting features that could be added to enhance its capabilities:

*   **Email-Based Accountability**: Implement a feature to ensure accountability by sending a summary of records and transactions via email. This could be sent to the user and designated third-party stakeholders (e.g., project managers, financial advisors, or team members) to keep everyone informed and aligned.
*   **Calendar Integration**: Add the ability to sync schedules with popular calendar services like Google Calendar or Outlook Calendar.
*   **Recurring Tasks**: Allow users to define recurring tasks (e.g., daily stand-ups, weekly reports) that are automatically added to the schedule.
*   **Advanced Reporting**: Generate more detailed financial and productivity reports, offering insights into spending habits and time allocation.
