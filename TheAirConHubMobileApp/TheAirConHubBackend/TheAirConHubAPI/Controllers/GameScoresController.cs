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
    public class GameScoresController : ControllerBase
    {
        private readonly TheAirConHubDbContext _context;

        public GameScoresController(TheAirConHubDbContext context)
        {
            _context = context;
        }

        // GET: api/GameScores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameScore>>> GetGameScores()
        {
            return await _context.GameScores.ToListAsync();
        }

        // GET: api/GameScores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GameScore>> GetGameScore(int id)
        {
            var gameScore = await _context.GameScores.FindAsync(id);

            if (gameScore == null)
            {
                return NotFound();
            }

            return gameScore;
        }

        // PUT: api/GameScores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGameScore(int id, GameScore gameScore)
        {
            if (id != gameScore.ScoreId)
            {
                return BadRequest();
            }

            _context.Entry(gameScore).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GameScoreExists(id))
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

        // POST: api/GameScores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<GameScore>> PostGameScore(GameScore gameScore)
        {
            _context.GameScores.Add(gameScore);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGameScore", new { id = gameScore.ScoreId }, gameScore);
        }

        // DELETE: api/GameScores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGameScore(int id)
        {
            var gameScore = await _context.GameScores.FindAsync(id);
            if (gameScore == null)
            {
                return NotFound();
            }

            _context.GameScores.Remove(gameScore);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GameScoreExists(int id)
        {
            return _context.GameScores.Any(e => e.ScoreId == id);
        }
    }
}
