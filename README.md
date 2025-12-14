# Square Root Trainer

A Windows desktop application that helps you memorize square roots of numbers 1-20 through audio-based spaced repetition.

![Square Root Trainer Application](docs/screenshot.png)

## What It Does

Square Root Trainer uses text-to-speech to quiz you on square roots at regular intervals. The app speaks a question (like "What is the square root of 144?"), gives you time to think, and then tells you the answer. This hands-free approach lets you practice while doing other tasks.

## How to Use

1. **Choose your language** - English or Dutch
2. **Set your timing preferences**:
   - Time to answer: How many seconds you get to think (default: 3)
   - Interval time: How long to wait between questions (default: 5)
3. **Click "Start Training"** and listen to the questions
4. **Think of the answer** during the pause
5. **Hear the correct answer** and repeat

The app randomly selects from square roots 1-20 (perfect squares 1-400), helping you build familiarity through repetition.

## Requirements

- Windows 10 or later
- .NET 9.0 Runtime

## Installation

```powershell
dotnet build SquareRootTrainer.csproj
dotnet run --project SquareRootTrainer.csproj
```
