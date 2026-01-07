# Square Root Trainer - HTML5 Application

This is the HTML5/TypeScript implementation of the Square Root Trainer application.

## Files

- `index.html` - Main HTML page with embedded CSS styling
- `app.ts` - TypeScript source code with all application logic
- `app.js` - Compiled JavaScript (generated from app.ts)
- `styles.css` - Minimal additional styles
- `tsconfig.json` - TypeScript compiler configuration
- `audio/` - Pre-generated audio files in English (en-US) and Dutch (nl-NL)

## Running Locally

You can run this application in several ways:

### Option 1: Open Directly
Simply open `index.html` in a web browser. This works for basic testing.

### Option 2: Use a Local Web Server
For full functionality (especially audio playback), serve the files with a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server (install with: npm install -g http-server)
http-server -p 8000

# Then open http://localhost:8000 in your browser
```

## Development

### Prerequisites
- TypeScript compiler (install with: `npm install -g typescript`)

### Making Changes

1. Edit `app.ts` to modify the application logic
2. Compile TypeScript to JavaScript:
   ```bash
   tsc
   ```
3. Reload `index.html` in your browser to see changes

### TypeScript Classes

- **AudioPlayer**: Manages HTML5 audio playback
- **TrainingSession**: Core training loop with question cycles and countdowns
- **SquareRootTrainerApp**: Main application controller and UI manager
- **EnglishTexts/DutchTexts**: Localization strings

## Architecture

The application is structured as follows:

1. **UI Layer** (`index.html`): HTML structure and inline CSS styling
2. **Application Logic** (`app.ts`): TypeScript classes managing state and behavior
3. **Audio Playback**: HTML5 Audio API with WAV files
4. **No Build Step Required**: Can run directly in browser with pre-compiled JavaScript

## Audio Files

Audio files are organized by language code:
- `audio/en-US/` - English audio files
- `audio/nl-NL/` - Dutch audio files

Each folder contains:
- `question_1.wav` through `question_20.wav` - "What is the square root of X?"
- `answer_1.wav` through `answer_20.wav` - "The square root of X is Y"
- `announcement.wav` - "The answer follows shortly"

Audio files are generated using the AudioGenerator tool (Windows only) in the parent directory.

## Features

- ✅ Bilingual support (English and Dutch)
- ✅ Configurable timing and number range
- ✅ Input validation with error messages
- ✅ Countdown timers between questions
- ✅ Start/Stop training controls
- ✅ Disabled inputs during training
- ✅ Clean, modern UI design
- ✅ No external dependencies (except TypeScript for development)
- ✅ Works entirely client-side

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Audio API
- ES2020 JavaScript features
- CSS3 Grid and Flexbox

Tested in: Chrome, Firefox, Safari, Edge
