using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class GameScore
{
    public int ScoreId { get; set; }

    public int? UserId { get; set; }

    public string GameKey { get; set; } = null!;

    public int ScoreValue { get; set; }

    public DateTime? PlayedAt { get; set; }

    public virtual User? User { get; set; }
}
