using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Threading;
using System;
using System.Speech.Synthesis;
using System.Threading;
using System.Threading.Tasks;

namespace MathTrainer;

public partial class MainWindow : Window
{
    // Change these constants to adjust timing
    private const int INTERVAL_SECONDS = 5; // Time between question cycles (change to 600 for 10 minutes)
    private const int SECONDS_TO_ANSWER = 10; // Time given to answer the question
    private const int BRIEF_PAUSE_MS = 1000; // Brief pause after asking question (in milliseconds)
    
    private readonly SpeechSynthesizer _synthesizer;
    private readonly Random _random;
    private bool _isRunning = false;
    private CancellationTokenSource? _cancellationTokenSource;

    public MainWindow()
    {
        InitializeComponent();
        
        _synthesizer = new SpeechSynthesizer();
        _synthesizer.SetOutputToDefaultAudioDevice();
        _random = new Random();
    }

    private void StartStopButton_Click(object? sender, RoutedEventArgs e)
    {
        if (_isRunning)
        {
            StopTraining();
        }
        else
        {
            StartTraining();
        }
    }

    private void StartTraining()
    {
        _isRunning = true;
        StartStopButton.Content = "Stop";
        
        _cancellationTokenSource = new CancellationTokenSource();
        
        // Start the training loop
        _ = TrainingLoopAsync(_cancellationTokenSource.Token);
    }

    private void StopTraining()
    {
        _isRunning = false;
        _cancellationTokenSource?.Cancel();
        StartStopButton.Content = "Start";
    }

    private async Task TrainingLoopAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            await AskQuestionCycleAsync(cancellationToken);
            
            if (!cancellationToken.IsCancellationRequested)
            {
                // Wait for the interval before the next question cycle
                await Task.Delay(TimeSpan.FromSeconds(INTERVAL_SECONDS), cancellationToken);
            }
        }
    }

    private async Task AskQuestionCycleAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Generate a random number from 1 to 20
            int number = _random.Next(1, 21);
            int square = number * number;
            
            // Phase 1: Ask the question
            string question = $"What is the square root of {square}?";
            _synthesizer.Speak(question);
            
            if (cancellationToken.IsCancellationRequested) return;
            
            // Phase 2: Brief pause
            await Task.Delay(BRIEF_PAUSE_MS, cancellationToken);
            
            if (cancellationToken.IsCancellationRequested) return;
            
            // Phase 3: Tell how much time they have
            string timeAnnouncement = $"You have {SECONDS_TO_ANSWER} seconds to answer the question.";
            _synthesizer.Speak(timeAnnouncement);
            
            if (cancellationToken.IsCancellationRequested) return;
            
            // Phase 4: Wait for the answer time
            await Task.Delay(TimeSpan.FromSeconds(SECONDS_TO_ANSWER), cancellationToken);
            
            if (cancellationToken.IsCancellationRequested) return;
            
            // Phase 5: Give the answer
            string answer = $"The square root of {square} is {number}.";
            _synthesizer.Speak(answer);
        }
        catch (TaskCanceledException)
        {
            // Expected when stopping
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in question cycle: {ex.Message}");
        }
    }

    protected override void OnClosed(EventArgs e)
    {
        _cancellationTokenSource?.Cancel();
        _synthesizer.Dispose();
        base.OnClosed(e);
    }
}
