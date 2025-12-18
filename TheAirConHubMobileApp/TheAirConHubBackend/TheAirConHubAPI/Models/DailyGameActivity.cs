using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class DailyGameActivity
{
    public int ActivityId { get; set; }

    public int? UserId { get; set; }

    public string? SlotKey { get; set; }

    public DateOnly? PlayDate { get; set; }

    public virtual User? User { get; set; }
}
