namespace MathTrainer;

public interface ILanguageTexts
{
    string Question { get; }
    string TimeAnnouncement { get; }
    string Answer { get; }
}

public class EnglishTexts : ILanguageTexts
{
    public string Question => "What is the square root of {0}?";
    public string TimeAnnouncement => "You have {0} seconds to answer the question.";
    public string Answer => "The square root of {0} is {1}.";
}

public class DutchTexts : ILanguageTexts
{
    public string Question => "Wat is de wortel van {0}?";
    public string TimeAnnouncement => "Je hebt {0} seconden om de vraag te beantwoorden.";
    public string Answer => "De wortel van {0} is {1}.";
}
