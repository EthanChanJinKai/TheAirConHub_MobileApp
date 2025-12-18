using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;
    public string Username { get; set; }
    public string Password { get; set; }

    public string? PhoneNumber { get; set; }

    public int? PointsBalance { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<DailyGameActivity> DailyGameActivities { get; set; } = new List<DailyGameActivity>();

    public virtual ICollection<GameScore> GameScores { get; set; } = new List<GameScore>();

    public virtual ICollection<UserRedemption> UserRedemptions { get; set; } = new List<UserRedemption>();
}
