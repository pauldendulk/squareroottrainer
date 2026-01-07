// Localization support
interface ILanguageTexts {
    // UI texts
    windowTitle: string;
    windowSubtitle: string;
    languageLabel: string;
    answerTimeLabel: string;
    intervalTimeLabel: string;
    lowestNumberLabel: string;
    highestNumberLabel: string;
    startButton: string;
    stopButton: string;
    countdownNextQuestion: string; // Format: "Next question in {0} {1}"
    countdownRemaining: string; // Format: "{0} {1} remaining"
    seconds: string;
    second: string;
    errorMinMaxValidation: string;
    errorMinTooLow: string;
    errorMaxTooHigh: string;
}

class EnglishTexts implements ILanguageTexts {
    windowTitle = "Square Root Trainer";
    windowSubtitle = "Start the app and keep it running in the background while you answer the questions in your head when they come up.";
    languageLabel = "Language";
    answerTimeLabel = "Time to answer (s)";
    intervalTimeLabel = "Interval time (s)";
    lowestNumberLabel = "Lowest Number";
    highestNumberLabel = "Highest Number";
    startButton = "Start Training";
    stopButton = "Stop";
    countdownNextQuestion = "Next question in {0} {1}";
    countdownRemaining = "{0} {1} remaining";
    seconds = "seconds";
    second = "second";
    errorMinMaxValidation = "Min must be ≤ max";
    errorMinTooLow = "Min must be ≥ 1";
    errorMaxTooHigh = "Max must be ≤ 20";
}

class DutchTexts implements ILanguageTexts {
    windowTitle = "Worteltrainer";
    windowSubtitle = "Start de app en laat deze op de achtergrond draaien terwijl je de vragen in je hoofd beantwoordt wanneer ze gesteld worden.";
    languageLabel = "Taal";
    answerTimeLabel = "Tijd voor antwoord (s)";
    intervalTimeLabel = "Interval tijd (s)";
    lowestNumberLabel = "Laagste Getal";
    highestNumberLabel = "Hoogste Getal";
    startButton = "Start Training";
    stopButton = "Stop";
    countdownNextQuestion = "Volgende vraag over {0} {1}";
    countdownRemaining = "Nog {0} {1}";
    seconds = "seconden";
    second = "seconde";
    errorMinMaxValidation = "Min moet ≤ max zijn";
    errorMinTooLow = "Min moet ≥ 1 zijn";
    errorMaxTooHigh = "Max moet ≤ 20 zijn";
}

// Configuration for a training session
interface TrainingSessionConfig {
    answerTimeSeconds: number;
    intervalSeconds: number;
    lowestNumber: number;
    highestNumber: number;
    languageCode: string;
}

// Audio player using HTML5 Audio API
class AudioPlayer {
    private audioBasePath: string;
    private currentAudio: HTMLAudioElement | null = null;

    constructor(audioBasePath: string) {
        this.audioBasePath = audioBasePath;
    }

    async playAsync(fileName: string, languageCode: string, signal: AbortSignal): Promise<void> {
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

            const onError = (e: ErrorEvent) => {
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

    stop(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
}

// Training session manager
class TrainingSession {
    private static readonly BRIEF_PAUSE_MS = 1000;

    private abortController: AbortController | null = null;
    private isRunning = false;

    constructor(
        private playAudioCallback: (fileName: string, languageCode: string, signal: AbortSignal) => Promise<void>,
        private updateCountdownCallback: (text: string) => void,
        private formatCountdownCallback: (seconds: number, isNextQuestion: boolean) => void
    ) {}

    getIsRunning(): boolean {
        return this.isRunning;
    }

    start(config: TrainingSessionConfig): void {
        if (this.isRunning) {
            throw new Error("Training session is already running");
        }

        this.isRunning = true;
        this.abortController = new AbortController();

        // Start the training loop
        this.trainingLoopAsync(config, this.abortController.signal).catch((err) => {
            // Silently ignore AbortError (expected when stopping)
            if (err.name !== 'AbortError') {
                console.error('Training loop error:', err);
            }
        });
    }

    async stopAsync(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.abortController?.abort();

        // Clear countdown when stopped
        this.updateCountdownCallback("");
    }

    private async trainingLoopAsync(config: TrainingSessionConfig, signal: AbortSignal): Promise<void> {
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

    private async askQuestionCycleAsync(config: TrainingSessionConfig, signal: AbortSignal): Promise<void> {
        try {
            // Generate a random number within the configured range
            const number = Math.floor(Math.random() * (config.highestNumber - config.lowestNumber + 1)) + config.lowestNumber;

            // Phase 1: Ask the question
            await this.playAudioCallback(`question_${number}.wav`, config.languageCode, signal);

            if (signal.aborted) return;

            // Phase 2: Brief pause
            await this.delay(TrainingSession.BRIEF_PAUSE_MS, signal);

            if (signal.aborted) return;

            // Phase 3: Announcement
            await this.playAudioCallback("announcement.wav", config.languageCode, signal);

            if (signal.aborted) return;

            // Phase 4: Wait for the answer time with countdown
            await this.countdownAsync(config.answerTimeSeconds, false, signal);

            if (signal.aborted) return;

            // Phase 5: Give the answer
            await this.playAudioCallback(`answer_${number}.wav`, config.languageCode, signal);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Expected when stopping
                return;
            }
            throw err;
        }
    }

    private async countdownAsync(seconds: number, isNextQuestion: boolean, signal: AbortSignal): Promise<void> {
        for (let i = seconds; i > 0; i--) {
            if (signal.aborted) break;

            // Use callback to format and display countdown
            this.formatCountdownCallback(i, isNextQuestion);

            // Wait 1 second
            await this.delay(1000, signal);
        }

        // Clear the countdown text
        this.updateCountdownCallback("");
    }

    private async delay(ms: number, signal: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);

            const onAbort = () => {
                clearTimeout(timeout);
                const error = new Error('Operation aborted');
                error.name = 'AbortError';
                reject(error);
            };

            signal.addEventListener('abort', onAbort, { once: true });
        });
    }
}

// Main application class
class SquareRootTrainerApp {
    private static readonly DEFAULT_INTERVAL_SECONDS = 300;
    private static readonly DEFAULT_SECONDS_TO_ANSWER = 3;
    private static readonly DEFAULT_LOWEST_NUMBER = 4;
    private static readonly DEFAULT_HIGHEST_NUMBER = 20;
    private static readonly MAX_SUPPORTED_NUMBER = 20;
    private static readonly MIN_SUPPORTED_NUMBER = 1;
    private static readonly ERROR_COLOR = "#DC2626";
    private static readonly NORMAL_COLOR = "#6366F1";

    private audioPlayer: AudioPlayer;
    private trainingSession: TrainingSession;
    private currentTexts: ILanguageTexts;
    private availableLanguages: { displayName: string; languageCode: string }[] = [];

    // UI Elements
    private titleElement!: HTMLElement;
    private subtitleElement!: HTMLElement;
    private languageLabelElement!: HTMLElement;
    private answerTimeLabelElement!: HTMLElement;
    private intervalTimeLabelElement!: HTMLElement;
    private lowestNumberLabelElement!: HTMLElement;
    private highestNumberLabelElement!: HTMLElement;
    private languageSelect!: HTMLSelectElement;
    private answerTimeInput!: HTMLInputElement;
    private intervalTimeInput!: HTMLInputElement;
    private lowestNumberInput!: HTMLInputElement;
    private highestNumberInput!: HTMLInputElement;
    private startStopButton!: HTMLButtonElement;
    private countdownText!: HTMLElement;

    constructor() {
        this.audioPlayer = new AudioPlayer('audio');
        this.currentTexts = new DutchTexts(); // Default to Dutch

        // Initialize training session with callbacks
        this.trainingSession = new TrainingSession(
            (fileName, languageCode, signal) => this.audioPlayer.playAsync(fileName, languageCode, signal),
            (text) => this.updateCountdownText(text),
            (seconds, isNextQuestion) => this.formatAndUpdateCountdown(seconds, isNextQuestion)
        );
    }

    async initialize(): Promise<void> {
        // Get UI elements
        this.titleElement = document.getElementById('title')!;
        this.subtitleElement = document.getElementById('subtitle')!;
        this.languageLabelElement = document.getElementById('languageLabel')!;
        this.answerTimeLabelElement = document.getElementById('answerTimeLabel')!;
        this.intervalTimeLabelElement = document.getElementById('intervalTimeLabel')!;
        this.lowestNumberLabelElement = document.getElementById('lowestNumberLabel')!;
        this.highestNumberLabelElement = document.getElementById('highestNumberLabel')!;
        this.languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
        this.answerTimeInput = document.getElementById('answerTime') as HTMLInputElement;
        this.intervalTimeInput = document.getElementById('intervalTime') as HTMLInputElement;
        this.lowestNumberInput = document.getElementById('lowestNumber') as HTMLInputElement;
        this.highestNumberInput = document.getElementById('highestNumber') as HTMLInputElement;
        this.startStopButton = document.getElementById('startStopButton') as HTMLButtonElement;
        this.countdownText = document.getElementById('countdownText')!;

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

    private async populateAvailableLanguages(): Promise<void> {
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

    private onLanguageChanged(): void {
        if (this.trainingSession.getIsRunning()) {
            // Don't allow language change while training is running
            return;
        }

        const selectedLanguageCode = this.languageSelect.value;

        // Determine which text set to use based on language code
        if (selectedLanguageCode.startsWith('nl')) {
            this.currentTexts = new DutchTexts();
        } else {
            this.currentTexts = new EnglishTexts();
        }

        this.updateUILanguage();
    }

    private updateUILanguage(): void {
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

    private validateInputs(): { valid: boolean; errorMessage?: string } {
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

    private showValidationError(message: string): void {
        this.countdownText.textContent = message;
        this.countdownText.style.color = SquareRootTrainerApp.ERROR_COLOR;
    }

    private clearValidationError(): void {
        this.countdownText.textContent = "";
        this.countdownText.style.color = SquareRootTrainerApp.NORMAL_COLOR;
    }

    private onStartStopClicked(): void {
        if (this.trainingSession.getIsRunning()) {
            this.stopTraining();
        } else {
            this.startTraining();
        }
    }

    private startTraining(): void {
        // Validate inputs
        const validation = this.validateInputs();
        if (!validation.valid) {
            this.showValidationError(validation.errorMessage!);
            return;
        }

        // Clear any previous error
        this.clearValidationError();

        // Create configuration from UI inputs
        const config: TrainingSessionConfig = {
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

    private async stopTraining(): Promise<void> {
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

    private updateCountdownText(text: string): void {
        this.countdownText.textContent = text;
    }

    private formatAndUpdateCountdown(seconds: number, isNextQuestion: boolean): void {
        const secondWord = seconds !== 1 ? this.currentTexts.seconds : this.currentTexts.second;
        if (isNextQuestion) {
            this.countdownText.textContent = this.currentTexts.countdownNextQuestion
                .replace('{0}', seconds.toString())
                .replace('{1}', secondWord);
        } else {
            this.countdownText.textContent = this.currentTexts.countdownRemaining
                .replace('{0}', seconds.toString())
                .replace('{1}', secondWord);
        }
    }

    private getAnswerTimeSeconds(): number {
        const value = parseInt(this.answerTimeInput.value);
        return !isNaN(value) && value > 0 ? value : SquareRootTrainerApp.DEFAULT_SECONDS_TO_ANSWER;
    }

    private getIntervalSeconds(): number {
        const value = parseInt(this.intervalTimeInput.value);
        return !isNaN(value) && value > 0 ? value : SquareRootTrainerApp.DEFAULT_INTERVAL_SECONDS;
    }

    private getLowestNumber(): number {
        const value = parseInt(this.lowestNumberInput.value);
        return !isNaN(value) ? value : SquareRootTrainerApp.DEFAULT_LOWEST_NUMBER;
    }

    private getHighestNumber(): number {
        const value = parseInt(this.highestNumberInput.value);
        return !isNaN(value) ? value : SquareRootTrainerApp.DEFAULT_HIGHEST_NUMBER;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new SquareRootTrainerApp();
    await app.initialize();
});
