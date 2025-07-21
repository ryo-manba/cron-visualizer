# cron-visualizer

Translations: [English](/README.md) [日本語 (Japanese)](docs/README-ja.md)

This is an application for visualizing cron expressions.<br>
You can enter any cron expression and visually check when it will execute on a weekly calendar.

## Features

- Input and visualization of cron expressions
- Switching between JST and UTC time formats
- Display of cron execution times on a weekly calendar
- Instant Apply mode for real-time visualization as you type
- Dark mode support with system preference detection

## How to Use

- Enter any cron expression into the cron expression input field. For example, \* \* \* \* \* means execute every minute.
- Switch between JST and UTC time formats. The default is JST.
- Click the "Visualize" button to execute the visualization of the cron expression.
- Toggle "Instant Apply" mode to automatically visualize changes as you type (with debouncing for performance).
- The execution times of the cron expression will be displayed on the calendar. The spots marked with a red circle are the execution times.

## Technology Stack

- React
- TypeScript
- moment-timezone
- cron-parser
- Recharts

## Screenshots

### Light Mode

<img width="1200" alt="Screenshot: Cron Visualizer app interface in light mode" src="/public/screenshot-light.png">

### Dark Mode

<img width="1200" alt="Screenshot: Cron Visualizer app interface in dark mode" src="/public/screenshot-dark.png">
