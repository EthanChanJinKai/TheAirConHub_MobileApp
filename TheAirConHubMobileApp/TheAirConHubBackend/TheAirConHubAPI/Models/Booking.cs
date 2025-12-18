using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int? UserId { get; set; }

    public int? ServiceId { get; set; }

    public DateTime BookingDate { get; set; }

    public string? TimeSlot { get; set; }

    public string? Status { get; set; }

    public string? TechnicianName { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Service? Service { get; set; }

    public virtual User? User { get; set; }
}
