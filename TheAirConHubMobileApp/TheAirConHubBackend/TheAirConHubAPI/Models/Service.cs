using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class Service
{
    public int ServiceId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string? IconName { get; set; }

    public string? ColorHex { get; set; }

    public decimal? BasePrice { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
