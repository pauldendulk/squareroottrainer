"use strict";
class EnglishTexts {
    constructor() {
        this.windowTitle = "Square Root Trainer";
        this.windowSubtitle = "Start the app and keep it running in the background while you answer the questions in your head when they come up.";
        this.languageLabel = "Language";
        this.answerTimeLabel = "Time to answer (s)";
        this.intervalTimeLabel = "Interval time (s)";
        this.lowestNumberLabel = "Lowest Number";
        this.highestNumberLabel = "Highest Number";
        this.startButton = "Start Training";
        this.stopButton = "Stop";
        this.countdownNextQuestion = "Next question in {0} {1}";
        this.countdownRemaining = "{0} {1} remaining";
        this.seconds = "seconds";
        this.second = "second";
        this.errorMinMaxValidation = "Min must be ≤ max";
        this.errorMinTooLow = "Min must be ≥ 1";
        this.errorMaxTooHigh = "Max must be ≤ 20";
    }
}
class DutchTexts {
    constructor() {
        this.windowTitle = "Worteltrainer";
        this.windowSubtitle = "Start de app en laat deze op de achtergrond draaien terwijl je de vragen in je hoofd beantwoordt wanneer ze gesteld worden.";
        this.languageLabel = "Taal";
        this.answerTimeLabel = "Tijd voor antwoord (s)";
        this.intervalTimeLabel = "Interval tijd (s)";
        this.lowestNumberLabel = "Laagste Getal";
        this.highestNumberLabel = "Hoogste Getal";
        this.startButton = "Start Training";
        this.stopButton = "Stop";
        this.countdownNextQuestion = "Volgende vraag over {0} {1}";
        this.countdownRemaining = "Nog {0} {1}";
        this.seconds = "seconden";
        this.second = "seconde";
        this.errorMinMaxValidation = "Min moet ≤ max zijn";
        this.errorMinTooLow = "Min moet ≥ 1 zijn";
        this.errorMaxTooHigh = "Max moet ≤ 20 zijn";
    }
}
// Audio player using HTML5 Audio API
class AudioPlayer {
    constructor(audioBasePath) {
        this.currentAudio = null;
        this.audioBasePath = audioBasePath;
    }
    async playAsync(fileName, languageCode, signal) {
        if (signal.aborted) {
            return;
        }
        const audioPath = `${this.audioBasePath}/${languageCode}/${fileName}`;
        return new Promise((resolve, reject) => {
            this.currentAudio = new Audio(audioPath);
            const onEnded = () => {
                cleanup();
                resolve();
            };
            const onError = (e) => {
                cleanup();
                console.error(`Audio playback error: ${audioPath}`, e);
                reject(new Error(`Failed to play audio: ${audioPath}`));
            };
            const onAbort = () => {
                cleanup();
                reject(new Error('Audio playback aborted'));
            };
            const cleanup = () => {
                if (this.currentAudio) {
                    this.currentAudio.removeEventListener('ended', onEnded);
                    this.currentAudio.removeEventListener('error', onError);
                    this.currentAudio.pause();
                    this.currentAudio = null;
                }
                signal.removeEventListener('abort', onAbort);
            };
            signal.addEventListener('abort', onAbort);
            this.currentAudio.addEventListener('ended', onEnded);
            this.currentAudio.addEventListener('error', onError);
            this.currentAudio.play().catch((err) => {
                cleanup();
                reject(err);
            });
        });
    }
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
}
// Training session manager
class TrainingSession {
    constructor(playAudioCallback, updateCountdownCallback, formatCountdownCallback) {
        this.playAudioCallback = playAudioCallback;
        this.updateCountdownCallback = updateCountdownCallback;
        this.formatCountdownCallback = formatCountdownCallback;
        this.abortController = null;
        this.isRunning = false;
    }
    getIsRunning() {
        return this.isRunning;
    }
    start(config) {
        if (this.isRunning) {
            throw new Error("Training session is already running");
        }
        this.isRunning = true;
        this.abortController = new AbortController();
        // Start the training loop
        this.trainingLoopAsync(config, this.abortController.signal).catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('Training loop error:', err);
            }
        });
    }
    async stopAsync() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        this.abortController?.abort();
        // Clear countdown when stopped
        this.updateCountdownCallback("");
    }
    async trainingLoopAsync(config, signal) {
        while (!signal.aborted) {
            await this.askQuestionCycleAsync(config, signal);
            if (!signal.aborted) {
                // Display countdown and wait for the interval before the next question cycle
                await this.countdownAsync(config.intervalSeconds, true, signal);
            }
        }
        // Clear countdown when loop ends
        this.updateCountdownCallback("");
    }
    async askQuestionCycleAsync(config, signal) {
        try {
            // Generate a random number within the configured range
            const number = Math.floor(Math.random() * (config.highestNumber - config.lowestNumber + 1)) + config.lowestNumber;
            // Phase 1: Ask the question
            await this.playAudioCallback(`question_${number}.wav`, config.languageCode, signal);
            if (signal.aborted)
                return;
            // Phase 2: Brief pause
            await this.delay(TrainingSession.BRIEF_PAUSE_MS, signal);
            if (signal.aborted)
                return;
            // Phase 3: Announcement
            await this.playAudioCallback("announcement.wav", config.languageCode, signal);
            if (signal.aborted)
                return;
            // Phase 4: Wait for the answer time with countdown
            await this.countdownAsync(config.answerTimeSeconds, false, signal);
            if (signal.aborted)
                return;
            // Phase 5: Give the answer
            await this.playAudioCallback(`answer_${number}.wav`, config.languageCode, signal);
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Expected when stopping
                return;
            }
            throw err;
        }
    }
    async countdownAsync(seconds, isNextQuestion, signal) {
        for (let i = seconds; i > 0; i--) {
            if (signal.aborted)
                break;
            // Use callback to format and display countdown
            this.formatCountdownCallback(i, isNextQuestion);
            // Wait 1 second
            await this.delay(1000, signal);
        }
        // Clear the countdown text
        this.updateCountdownCallback("");
    }
    async delay(ms, signal) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);
            const onAbort = () => {
                clearTimeout(timeout);
                reject(new Error('AbortError'));
            };
            signal.addEventListener('abort', onAbort, { once: true });
        });
    }
}
TrainingSession.BRIEF_PAUSE_MS = 1000;
// Main application class
class SquareRootTrainerApp {
    constructor() {
        this.availableLanguages = [];
        this.audioPlayer = new AudioPlayer('audio');
        this.currentTexts = new DutchTexts(); // Default to Dutch
        // Initialize training session with callbacks
        this.trainingSession = new TrainingSession((fileName, languageCode, signal) => this.audioPlayer.playAsync(fileName, languageCode, signal), (text) => this.updateCountdownText(text), (seconds, isNextQuestion) => this.formatAndUpdateCountdown(seconds, isNextQuestion));
    }
    async initialize() {
        // Get UI elements
        this.titleElement = document.getElementById('title');
        this.subtitleElement = document.getElementById('subtitle');
        this.languageLabelElement = document.getElementById('languageLabel');
        this.answerTimeLabelElement = document.getElementById('answerTimeLabel');
        this.intervalTimeLabelElement = document.getElementById('intervalTimeLabel');
        this.lowestNumberLabelElement = document.getElementById('lowestNumberLabel');
        this.highestNumberLabelElement = document.getElementById('highestNumberLabel');
        this.languageSelect = document.getElementById('languageSelect');
        this.answerTimeInput = document.getElementById('answerTime');
        this.intervalTimeInput = document.getElementById('intervalTime');
        this.lowestNumberInput = document.getElementById('lowestNumber');
        this.highestNumberInput = document.getElementById('highestNumber');
        this.startStopButton = document.getElementById('startStopButton');
        this.countdownText = document.getElementById('countdownText');
        // Set default values
        this.answerTimeInput.value = SquareRootTrainerApp.DEFAULT_SECONDS_TO_ANSWER.toString();
        this.intervalTimeInput.value = SquareRootTrainerApp.DEFAULT_INTERVAL_SECONDS.toString();
        this.lowestNumberInput.value = SquareRootTrainerApp.DEFAULT_LOWEST_NUMBER.toString();
        this.highestNumberInput.value = SquareRootTrainerApp.DEFAULT_HIGHEST_NUMBER.toString();
        // Populate available languages
        await this.populateAvailableLanguages();
        // Set up event listeners
        this.languageSelect.addEventListener('change', () => this.onLanguageChanged());
        this.startStopButton.addEventListener('click', () => this.onStartStopClicked());
        // Update UI with current language
        this.updateUILanguage();
    }
    async populateAvailableLanguages() {
        // Manually define available languages based on audio folder structure
        this.availableLanguages = [
            { displayName: "English (en-US)", languageCode: "en-US" },
            { displayName: "Nederlands (nl-NL)", languageCode: "nl-NL" }
        ];
        // Populate the select element
        this.languageSelect.innerHTML = '';
        this.availableLanguages.forEach((lang, index) => {
            const option = document.createElement('option');
            option.value = lang.languageCode;
            option.textContent = lang.displayName;
            this.languageSelect.appendChild(option);
        });
        // Select Dutch by default
        const dutchIndex = this.availableLanguages.findIndex(l => l.languageCode.startsWith('nl'));
        this.languageSelect.selectedIndex = dutchIndex >= 0 ? dutchIndex : 0;
        // Update texts based on selected language
        this.onLanguageChanged();
    }
    onLanguageChanged() {
        if (this.trainingSession.getIsRunning()) {
            // Don't allow language change while training is running
            return;
        }
        const selectedLanguageCode = this.languageSelect.value;
        // Determine which text set to use based on language code
        if (selectedLanguageCode.startsWith('nl')) {
            this.currentTexts = new DutchTexts();
        }
        else {
            this.currentTexts = new EnglishTexts();
        }
        this.updateUILanguage();
    }
    updateUILanguage() {
        document.title = this.currentTexts.windowTitle;
        this.titleElement.textContent = this.currentTexts.windowTitle;
        this.subtitleElement.textContent = this.currentTexts.windowSubtitle;
        this.languageLabelElement.textContent = this.currentTexts.languageLabel;
        this.answerTimeLabelElement.textContent = this.currentTexts.answerTimeLabel;
        this.intervalTimeLabelElement.textContent = this.currentTexts.intervalTimeLabel;
        this.lowestNumberLabelElement.textContent = this.currentTexts.lowestNumberLabel;
        this.highestNumberLabelElement.textContent = this.currentTexts.highestNumberLabel;
        this.startStopButton.textContent = this.trainingSession.getIsRunning()
            ? this.currentTexts.stopButton
            : this.currentTexts.startButton;
    }
    validateInputs() {
        const lowestNumber = parseInt(this.lowestNumberInput.value);
        const highestNumber = parseInt(this.highestNumberInput.value);
        const lowestValid = !isNaN(lowestNumber);
        const highestValid = !isNaN(highestNumber);
        // Check if lowest < minimum supported
        if (lowestValid && lowestNumber < SquareRootTrainerApp.MIN_SUPPORTED_NUMBER) {
            return { valid: false, errorMessage: this.currentTexts.errorMinTooLow };
        }
        // Check if highest > maximum supported
        if (highestValid && highestNumber > SquareRootTrainerApp.MAX_SUPPORTED_NUMBER) {
            return { valid: false, errorMessage: this.currentTexts.errorMaxTooHigh };
        }
        // Check if min > max
        if (lowestValid && highestValid && lowestNumber > highestNumber) {
            return { valid: false, errorMessage: this.currentTexts.errorMinMaxValidation };
        }
        return { valid: true };
    }
    showValidationError(message) {
        this.countdownText.textContent = message;
        this.countdownText.style.color = SquareRootTrainerApp.ERROR_COLOR;
    }
    clearValidationError() {
        this.countdownText.textContent = "";
        this.countdownText.style.color = SquareRootTrainerApp.NORMAL_COLOR;
    }
    onStartStopClicked() {
        if (this.trainingSession.getIsRunning()) {
            this.stopTraining();
        }
        else {
            this.startTraining();
        }
    }
    startTraining() {
        // Validate inputs
        const validation = this.validateInputs();
        if (!validation.valid) {
            this.showValidationError(validation.errorMessage);
            return;
        }
        // Clear any previous error
        this.clearValidationError();
        // Create configuration from UI inputs
        const config = {
            answerTimeSeconds: this.getAnswerTimeSeconds(),
            intervalSeconds: this.getIntervalSeconds(),
            lowestNumber: this.getLowestNumber(),
            highestNumber: this.getHighestNumber(),
            languageCode: this.languageSelect.value
        };
        // Update UI state
        this.startStopButton.textContent = this.currentTexts.stopButton;
        // Disable the input fields while running
        this.languageSelect.disabled = true;
        this.answerTimeInput.disabled = true;
        this.intervalTimeInput.disabled = true;
        this.lowestNumberInput.disabled = true;
        this.highestNumberInput.disabled = true;
        // Start the training session
        this.trainingSession.start(config);
    }
    async stopTraining() {
        await this.trainingSession.stopAsync();
        this.startStopButton.textContent = this.currentTexts.startButton;
        // Re-enable the input fields
        this.languageSelect.disabled = false;
        this.answerTimeInput.disabled = false;
        this.intervalTimeInput.disabled = false;
        this.lowestNumberInput.disabled = false;
        this.highestNumberInput.disabled = false;
    }
    // Callback methods for TrainingSession
    updateCountdownText(text) {
        this.countdownText.textContent = text;
    }
    formatAndUpdateCountdown(seconds, isNextQuestion) {
        const secondWord = seconds !== 1 ? this.currentTexts.seconds : this.currentTexts.second;
        if (isNextQuestion) {
            this.countdownText.textContent = this.currentTexts.countdownNextQuestion
                .replace('{0}', seconds.toString())
                .replace('{1}', secondWord);
        }
        else {
            this.countdownText.textContent = this.currentTexts.countdownRemaining
                .replace('{0}', seconds.toString())
                .replace('{1}', secondWord);
        }
    }
    getAnswerTimeSeconds() {
        const value = parseInt(this.answerTimeInput.value);
        return !isNaN(value) && value > 0 ? value : SquareRootTrainerApp.DEFAULT_SECONDS_TO_ANSWER;
    }
    getIntervalSeconds() {
        const value = parseInt(this.intervalTimeInput.value);
        return !isNaN(value) && value > 0 ? value : SquareRootTrainerApp.DEFAULT_INTERVAL_SECONDS;
    }
    getLowestNumber() {
        const value = parseInt(this.lowestNumberInput.value);
        return !isNaN(value) ? value : SquareRootTrainerApp.DEFAULT_LOWEST_NUMBER;
    }
    getHighestNumber() {
        const value = parseInt(this.highestNumberInput.value);
        return !isNaN(value) ? value : SquareRootTrainerApp.DEFAULT_HIGHEST_NUMBER;
    }
}
SquareRootTrainerApp.DEFAULT_INTERVAL_SECONDS = 300;
SquareRootTrainerApp.DEFAULT_SECONDS_TO_ANSWER = 3;
SquareRootTrainerApp.DEFAULT_LOWEST_NUMBER = 4;
SquareRootTrainerApp.DEFAULT_HIGHEST_NUMBER = 20;
SquareRootTrainerApp.MAX_SUPPORTED_NUMBER = 20;
SquareRootTrainerApp.MIN_SUPPORTED_NUMBER = 1;
SquareRootTrainerApp.ERROR_COLOR = "#DC2626";
SquareRootTrainerApp.NORMAL_COLOR = "#6366F1";
// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new SquareRootTrainerApp();
    await app.initialize();
});
