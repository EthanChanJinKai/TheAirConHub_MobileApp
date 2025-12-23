using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TheAirConHubAPI.Models;

namespace TheAirConHubAPI.Models
{
    public class DailyGameActivity
    {
        [Key]
        public int ActivityId { get; set; }
        public int UserId { get; set; }
        public string GameId { get; set; } // We will use names like "Snake", "Quiz"
        public int AttemptsUsed { get; set; }
        public DateTime LastPlayedDate { get; set; }
        public string? SlotKey { get; set; }
        public DateOnly? PlayDate { get; set; }
        public virtual User? User { get; set; }
    }

}


