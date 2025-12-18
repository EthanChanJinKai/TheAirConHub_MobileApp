using System;
using System.Collections.Generic;

namespace TheAirConHubAPI.Models;

public partial class UserRedemption
{
    public int RedemptionId { get; set; }

    public int? UserId { get; set; }

    public int? RewardId { get; set; }

    public DateTime? RedeemedAt { get; set; }

    public virtual RewardsCatalog? Reward { get; set; }

    public virtual User? User { get; set; }
}
