using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheAirConHubAPI.Models;
using BCrypt.Net; // Import BCrypt

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
            // 1. Validation
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists.");
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("Username already taken.");
            }

            // 2. Hash the Password (The Magic Step)
            // We turn "password123" into "$2a$11$Zpw..."
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Create User with the HASH
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Username = request.Username,
                Password = passwordHash, // Store the hash, NEVER plain text
                PointsBalance = 0,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful!", userId = user.UserId });
        }

        // POST: api/Auth/Login
        [HttpPost("Login")]
        public async Task<ActionResult> Login(LoginRequest request)
        {
            // 1. Find User
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

            if (user == null)
            {
                return BadRequest("User not found.");
            }

            // 2. Verify Password using BCrypt
            // logic: Verify(userTypedPassword, databaseHashedPassword)
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

            if (!isPasswordValid)
            {
                return BadRequest("Wrong password.");
            }

            // 3. Success
            return Ok(new
            {
                message = "Login successful!",
                userId = user.UserId,
                name = user.Username,
                email = user.Email,
                pointsBalance = user.PointsBalance
            });
        }
    }

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