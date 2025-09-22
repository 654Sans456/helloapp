using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace helloapp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private static List<GameResult> results = new List<GameResult>();
        private static int nextId = 0;

        [HttpGet("results")]
        public IActionResult GetResults()
        {
            return Ok(results);
        }

        [HttpPost("results")]
        public IActionResult PostResult([FromBody] GameResultRequest request)
        {
            var result = new GameResult
            {
                Id = nextId++,
                PlayerName = request.PlayerName,
                IsWin = request.IsWin,
                TimeSeconds = request.TimeSeconds,
                FieldSize = request.FieldSize,
                MinesCount = request.MinesCount,
                GameDate = DateTime.Now
            };

            results.Add(result);
            return CreatedAtAction(nameof(GetResults), new { id = result.Id }, result);
        }

        [HttpPost("restart")]
        public IActionResult RestartGame([FromBody] GameSettings settings)
        {
            return Ok(new
            {
                message = "Game restarted",
                fieldSize = settings.FieldSize,
                minesCount = settings.MinesCount
            });
        }
    }

    public class GameResultRequest
    {
        [JsonPropertyName("playerName")]
        public string PlayerName { get; set; } = string.Empty;

        [JsonPropertyName("isWin")]
        public bool IsWin { get; set; }

        [JsonPropertyName("timeSeconds")]
        public int TimeSeconds { get; set; }

        [JsonPropertyName("fieldSize")]
        public string FieldSize { get; set; } = string.Empty;

        [JsonPropertyName("minesCount")]
        public int MinesCount { get; set; }
    }

    public class GameSettings
    {
        [JsonPropertyName("fieldSize")]
        public string FieldSize { get; set; } = string.Empty;

        [JsonPropertyName("minesCount")]
        public int MinesCount { get; set; }
    }
}
