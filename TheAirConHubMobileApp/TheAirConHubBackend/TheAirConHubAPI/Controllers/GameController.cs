using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheAirConHubAPI.Models;

namespace TheAirConHubAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly TheAirConHubDbContext _context;

        public GameController(TheAirConHubDbContext context)
        {
            _context = context;
        }

        // HELPER: Get Current Time in Singapore (GMT+8)
        private DateTime GetSingaporeTime()
        {
            return DateTime.UtcNow.AddHours(8);
        }

        [HttpGet("Status")]
        public async Task<ActionResult> GetGameStatus(int userId, string gameId)
        {
            var activity = await _context.DailyGameActivities
                .FirstOrDefaultAsync(a => a.UserId == userId && a.GameId == gameId);

            // If never played, they have 3 attempts
            if (activity == null)
            {
                return Ok(new { attemptsUsed = 0, attemptsLeft = 3, canPlay = true });
            }

            // CHECK: Is it a new day in SINGAPORE?
            DateTime sgNow = GetSingaporeTime();
            if (activity.LastPlayedDate.Date < sgNow.Date)
            {
                // Reset for the new day
                activity.AttemptsUsed = 0;
                activity.LastPlayedDate = sgNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                attemptsUsed = activity.AttemptsUsed,
                attemptsLeft = 3 - activity.AttemptsUsed,
                canPlay = activity.AttemptsUsed < 3
            });
        }

        [HttpPost("Start")]
        public async Task<ActionResult> StartGame([FromBody] GameStartRequest request)
        {
            var activity = await _context.DailyGameActivities
                .FirstOrDefaultAsync(a => a.UserId == request.UserId && a.GameId == request.GameId);

            DateTime sgNow = GetSingaporeTime();

            // 1. First time playing ever
            if (activity == null)
            {
                activity = new DailyGameActivity
                {
                    UserId = request.UserId,
                    GameId = request.GameId,
                    AttemptsUsed = 1,
                    LastPlayedDate = sgNow
                };
                _context.DailyGameActivities.Add(activity);
            }
            else
            {
                // 2. Check if it's a new day (SGT)
                if (activity.LastPlayedDate.Date < sgNow.Date)
                {
                    activity.AttemptsUsed = 1; // Reset and use 1
                    activity.LastPlayedDate = sgNow;
                }
                // 3. Same day, check limit
                else if (activity.AttemptsUsed >= 3)
                {
                    return BadRequest("Daily limit reached! Come back tomorrow.");
                }
                else
                {
                    activity.AttemptsUsed++; // Increment
                    activity.LastPlayedDate = sgNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Game Started", attemptsLeft = 3 - activity.AttemptsUsed });
        }
    }

    public class GameStartRequest
    {
        public int UserId { get; set; }
        public string GameId { get; set; }
    }
}