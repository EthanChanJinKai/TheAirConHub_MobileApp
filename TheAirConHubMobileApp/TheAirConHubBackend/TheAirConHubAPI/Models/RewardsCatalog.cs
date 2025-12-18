using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class RewardsCatalog
{
    public int RewardId { get; set; }

    public string Title { get; set; } = null!;

    public int PointCost { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<UserRedemption> UserRedemptions { get; set; } = new List<UserRedemption>();
}
