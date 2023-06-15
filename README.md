# cron-visualizer

Translations: [English](README.md) [日本語 (Japanese)](docs/README-ja.md)

This is an application for visualizing cron expressions.<br>
You can enter any cron expression and visually check when it will execute on a weekly calendar.

## Features

- Input and visualization of cron expressions
- Switching between JST and UTC time formats
- Display of cron execution times on a weekly calendar

## How to Use

- Enter any cron expression into the cron expression input field. For example, \* \* \* \* \* means execute every minute.
- Switch between JST and UTC time formats. The default is JST.
- Click the "Visualize" button to execute the visualization of the cron expression.
- The execution times of the cron expression will be displayed on the calendar. The spots marked with a red circle are the execution times.

## Technology Stack

- React
- TypeScript
- moment-timezone
- cron-parser
- Recharts

## Screenshots

<img width="1200" alt="Screenshot: Cron Visualizer app interface showing a sample cron schedule visualization" src="/public/screenshot.webp">
