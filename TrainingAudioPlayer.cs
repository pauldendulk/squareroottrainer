using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Media.Core;
using Windows.Media.Playback;
using Windows.Storage;

namespace SquareRootTrainer;

/// <summary>
/// Manages audio playback for the training session using Windows MediaPlayer.
/// </summary>
public class TrainingAudioPlayer : IDisposable
{
    private readonly MediaPlayer _mediaPlayer;
    private readonly string _audioBasePath;
    
    /// <summary>
    /// Creates a new audio player.
    /// </summary>
    /// <param name="audioBasePath">Base path to the audio files directory</param>
    public TrainingAudioPlayer(string audioBasePath)
    {
        _audioBasePath = audioBasePath;
        _mediaPlayer = new MediaPlayer();
    }
    
    /// <summary>
    /// Plays an audio file and waits for it to complete.
    /// </summary>
    /// <param name="fileName">Name of the audio file (e.g., "question_4.wav")</param>
    /// <param name="languageCode">Language code for the audio (e.g., "en-US")</param>
    /// <param name="cancellationToken">Token to cancel playback</param>
    public async Task PlayAsync(string fileName, string languageCode, CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested) return;

        try
        {
            var audioPath = Path.Combine(_audioBasePath, languageCode, fileName);
            
            if (!File.Exists(audioPath))
            {
                Console.WriteLine($"Warning: Audio file not found: {audioPath}");
                return;
            }
            
            var file = await StorageFile.GetFileFromPathAsync(audioPath);
            
            var tcs = new TaskCompletionSource();
            
            // Define handler to signal completion
            TypedEventHandler<MediaPlayer, object> onEnded = (s, e) => tcs.TrySetResult();
            
            try
            {
                _mediaPlayer.MediaEnded += onEnded;
                _mediaPlayer.Source = MediaSource.CreateFromStorageFile(file);
                _mediaPlayer.Play();
                
                // Wait for playback to finish or cancellation
                await tcs.Task.WaitAsync(cancellationToken);
            }
            finally
            {
                _mediaPlayer.MediaEnded -= onEnded;
            }
        }
        catch (OperationCanceledException)
        {
            _mediaPlayer.Pause();
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Audio playback error: {ex.Message}");
        }
    }
    
    /// <summary>
    /// Stops any currently playing audio.
    /// </summary>
    public void Stop()
    {
        _mediaPlayer.Pause();
    }
    
    public void Dispose()
    {
        _mediaPlayer.Dispose();
    }
}
