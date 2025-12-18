using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheAirConHubAPI.Models;

namespace TheAirConHubAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TheAirConHubDbContext _context;

        public AuthController(TheAirConHubDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/Register
        [HttpPost("Register")]
        public async Task<ActionResult<User>> Register(RegisterRequest request)
        {
            // 1. Basic Validation
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists.");
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("Username already taken.");
            }

            // 2. Create User (Stored as PLAIN TEXT for now)
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Username = request.Username,
                Password = request.Password, 
                PointsBalance = 0,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful!", userId = user.UserId }); // or user.UserId
        }

        // POST: api/Auth/Login
        [HttpPost("Login")]
        public async Task<ActionResult> Login(LoginRequest request)
        {
            // 1. Find the user by Username OR Email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // 2. Check Password (Direct string comparison)
            if (user.Password != request.Password)
            {
                return BadRequest("Wrong password.");
            }

            // 3. Success
            return Ok(new
            {
                message = "Login successful!",
                userId = user.UserId, // or user.UserId
                name = user.FullName, // or user.FullName
                email = user.Email
            });
        }
    }

    // DTOs (Data Transfer Objects) - What the frontend sends us
    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string UsernameOrEmail { get; set; }
        public string Password { get; set; }
    }
}