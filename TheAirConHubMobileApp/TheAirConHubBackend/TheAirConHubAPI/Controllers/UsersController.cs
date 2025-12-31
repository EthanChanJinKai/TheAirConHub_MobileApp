using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheAirConHubAPI.Models;

namespace TheAirConHubAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly TheAirConHubDbContext _context;

        public UsersController(TheAirConHubDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }

        [HttpPost("AddPoints")]
        public async Task<IActionResult> AddPoints([FromBody] AddPointsRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update the points
            // Use (?? 0) to handle cases where PointsBalance might be null
            user.PointsBalance = (user.PointsBalance ?? 0) + request.Points;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Points added successfully",
                newBalance = user.PointsBalance
            });
        }

        [HttpPost("StartGameAttempt")]
        public async Task<IActionResult> StartGameAttempt([FromBody] GameAttemptRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // 1. LAZY RESET: If last game was on a different day (or never), reset count
            var serverTime = DateTime.UtcNow.AddHours(8); // Adjust to Singapore Time (UTC+8) if needed, or just use DateTime.Now for local server time
            var today = serverTime.Date;

            if (user.LastGameDate == null || user.LastGameDate.Value.Date != today)
            {
                user.DailyAttempts = 0;
                user.LastGameDate = serverTime;
            }

            // 2. CHECK LIMIT
            if (user.DailyAttempts >= 3)
            {
                return BadRequest(new
                {
                    canPlay = false,
                    message = "Daily limit reached (3/3). Come back tomorrow!",
                    attempts = user.DailyAttempts
                });
            }

            // 3. INCREMENT & SAVE
            user.DailyAttempts++;
            user.LastGameDate = serverTime; // Update timestamp

            await _context.SaveChangesAsync();

            return Ok(new
            {
                canPlay = true,
                attempts = user.DailyAttempts,
                remaining = 3 - user.DailyAttempts
            });
        }


    } 

    
    public class AddPointsRequest
    {
        public int UserId { get; set; }
        public int Points { get; set; }
    }

    
    public class GameAttemptRequest
    {
        public int UserId { get; set; }
    }

}
