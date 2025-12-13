# Square Root Trainer

A Windows desktop application designed to help you memorize square roots of numbers 1-20 through spaced repetition and audio prompts.

## Overview

Square Root Trainer uses text-to-speech technology to periodically quiz you on square roots. The application asks questions, gives you time to think, and then provides the correct answer, helping you internalize these mathematical facts through repetition.

![Square Root Trainer Application](docs/screenshot.png)

*The clean, focused interface with configurable timing and language options*

## Features

- 🎯 **Spaced Repetition Learning** - Automatically cycles through questions at configurable intervals
- 🗣️ **Text-to-Speech Audio** - High-quality native voice synthesis using Windows Speech API
- 🌍 **Bilingual Support** - Full support for English and Dutch with native voices
- ⚙️ **Configurable Timing** - Customize answer time and rest intervals to your preference
- 🎨 **Clean Interface** - Minimalist UI focused on functionality
- ▶️ **Simple Controls** - Easy start/stop functionality

## Requirements

- Windows 10 or later
- .NET 9.0 Runtime
- Windows Speech Synthesis support

## Installation

### Option 1: Build from Source

1. Clone the repository:
   ```powershell
   git clone https://github.com/yourusername/wortels.git
   cd wortels
   ```

2. Build the project:
   ```powershell
   dotnet build MathTrainer.csproj
   ```

3. Run the application:
   ```powershell
   dotnet run --project MathTrainer.csproj
   ```

### Option 2: Download Release

Download the latest release from the [Releases](https://github.com/yourusername/wortels/releases) page and run the executable.

## Usage

1. **Select Language**: Choose between English or Dutch from the language dropdown
2. **Configure Timing** (Optional):
   - **Answer Time**: How many seconds you have to think of the answer (default: 3 seconds)
   - **Rest Time**: How many seconds to wait between questions (default: 5 seconds)
3. **Start Training**: Click the "Start" button to begin your training session
4. **Listen & Learn**: The app will:
   - Ask "What is the square root of [number]?"
   - Announce how many seconds you have to answer
   - Wait for your thinking time
   - Provide the correct answer
   - Rest before the next question
5. **Stop Training**: Click the "Stop" button to end your session

## How It Works

The training cycle follows these steps:

1. **Question Phase** - Asks for the square root of a random perfect square (1-400)
2. **Time Announcement** - Tells you how many seconds you have to think
3. **Wait Period** - Gives you time to mentally calculate the answer
4. **Answer Phase** - Provides the correct answer
5. **Rest Interval** - Waits before starting the next cycle

Perfect squares are randomly selected from: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400 (covering square roots 1-20).

## Technology Stack

- **Framework**: [Avalonia UI](https://avaloniaui.net/) 11.2.2
- **Runtime**: .NET 9.0
- **Text-to-Speech**: Windows.Media.SpeechSynthesis
- **Language**: C# 12

## Development

### Project Structure

```
wortels/
├── App.axaml              # Application-level resources and setup
├── App.axaml.cs           # Application entry point configuration
├── MainWindow.axaml       # Main UI layout
├── MainWindow.axaml.cs    # Main application logic
├── Texts.cs               # Localized strings (EN/NL)
├── Program.cs             # Application startup
└── MathTrainer.csproj     # Project configuration
```

### Building

```powershell
dotnet build MathTrainer.csproj
```

### Testing

```powershell
dotnet test
```

## Configuration

The application stores its settings in the UI and allows real-time configuration:

- **Language**: English (en-US) or Dutch (nl-NL)
- **Answer Time**: 1-60 seconds (default: 3)
- **Rest Time**: 1-60 seconds (default: 5)

Settings are applied when you start a new training session.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Avalonia UI](https://avaloniaui.net/) - A cross-platform UI framework
- Uses Windows Speech Synthesis for high-quality text-to-speech

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/wortels/issues) on GitHub.

---

**Note**: Replace `yourusername` in the URLs with your actual GitHub username before publishing.
