# Square Root Trainer

A web application that helps you memorize square roots of numbers 1-20 through audio-based spaced repetition.

**Try it now:** https://pauldendulk.github.io/squareroottrainer

<img width="491" height="600" alt="image" src="https://github.com/user-attachments/assets/0379fa85-5c60-4558-bda7-df9964e7b221" />

### Background

My daughter had a math test last week. She had to know the square roots of all numbers up to twenty. Her teacher said she taught this to her son by asking questions at random moments during the day. So I built an app that you can run in the background to ask for square roots at set intervals (five minutes by default).

## What It Does

Square Root Trainer uses pre-generated audio files to quiz you on square roots at regular intervals. The app plays a question (like "What is the square root of 144?"), gives you time to think, and then tells you the answer. This hands-free approach lets you practice while doing other tasks.

## How to Use

**Online Version (Recommended):**
Simply visit https://pauldendulk.github.io/squareroottrainer in your web browser.

**Local Development:**
Open `html-app/index.html` in a web browser, or serve it with a local web server:
```bash
cd html-app
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Using the App:**
1. **Choose your language** - English or Dutch
2. **Set your timing preferences**:
   - Time to answer: How many seconds you get to think (default: 3)
   - Interval time: How long to wait between questions (default: 300)
   - Lowest Number: Minimum square root to practice (default: 4)
   - Highest Number: Maximum square root to practice (default: 20)
3. **Click "Start Training"** and listen to the questions
4. **Think of the answer** during the pause
5. **Hear the correct answer** and repeat

The app randomly selects from the configured range of square roots, helping you build familiarity through repetition.

## Technical Details

### HTML5/TypeScript Implementation

The main application is built with modern web technologies:
- **HTML5**: Single-page application with semantic markup
- **TypeScript**: Type-safe application logic compiled to JavaScript
- **Tailwind CSS**: Utility-first CSS framework for styling via CDN
- **HTML5 Audio API**: Native browser audio playback for WAV files
- **ES2020**: Modern JavaScript features with async/await for timing logic

### Architecture

The application consists of several TypeScript classes:
- **AudioPlayer**: Manages HTML5 audio playback with promise-based API
- **TrainingSession**: Core training loop logic with question cycles and countdowns
- **SquareRootTrainerApp**: Main application controller handling UI and coordination
- **Localization**: Separate text classes for English and Dutch UI/speech text

### Audio Files

The application uses pre-generated audio files for both English and Dutch:
- `html-app/audio/en-US/` - English audio files
- `html-app/audio/nl-NL/` - Dutch audio files

Each language folder contains:
- `question_1.wav` through `question_20.wav` - Question prompts
- `answer_1.wav` through `answer_20.wav` - Answer responses
- `announcement.wav` - Time announcement

### Generating Audio Files

Audio files are generated using the AudioGenerator CLI tool (requires Windows), which uses Windows Speech Synthesis:

```powershell
cd AudioGenerator
dotnet run
```

This will regenerate all audio files in both languages.

## Legacy .NET/Avalonia Versions

The repository also contains legacy desktop implementations built with Avalonia and .NET 9:
- `SquareRootTrainer/` - Original Windows desktop version
- `Carrots/` - Cross-platform Avalonia version

These are preserved for reference but the HTML5 version is recommended for most users.

### Running the Desktop Versions

**SquareRootTrainer Desktop (Windows):**
```powershell
dotnet run --project SquareRootTrainer\SquareRootTrainer.csproj --framework net9.0-windows10.0.19041.0
```

**Carrots Desktop (Cross-platform):**
```powershell
dotnet run --project Carrots\Carrots.Desktop\Carrots.Desktop.csproj
```
