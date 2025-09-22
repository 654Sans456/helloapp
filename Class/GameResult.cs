using System;

namespace helloapp
{
    public class GameResult
    {
        public int Id { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public bool IsWin { get; set; }
        public int TimeSeconds { get; set; }
        public string FieldSize { get; set; }
        public int MinesCount { get; set; }
        public DateTime GameDate { get; set; }
    }
}
