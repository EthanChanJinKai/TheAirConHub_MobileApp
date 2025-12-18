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
    public class RewardsCatalogsController : ControllerBase
    {
        private readonly TheAirConHubDbContext _context;

        public RewardsCatalogsController(TheAirConHubDbContext context)
        {
            _context = context;
        }

        // GET: api/RewardsCatalogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RewardsCatalog>>> GetRewardsCatalogs()
        {
            return await _context.RewardsCatalogs.ToListAsync();
        }

        // GET: api/RewardsCatalogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RewardsCatalog>> GetRewardsCatalog(int id)
        {
            var rewardsCatalog = await _context.RewardsCatalogs.FindAsync(id);

            if (rewardsCatalog == null)
            {
                return NotFound();
            }

            return rewardsCatalog;
        }

        // PUT: api/RewardsCatalogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRewardsCatalog(int id, RewardsCatalog rewardsCatalog)
        {
            if (id != rewardsCatalog.RewardId)
            {
                return BadRequest();
            }

            _context.Entry(rewardsCatalog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RewardsCatalogExists(id))
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

        // POST: api/RewardsCatalogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RewardsCatalog>> PostRewardsCatalog(RewardsCatalog rewardsCatalog)
        {
            _context.RewardsCatalogs.Add(rewardsCatalog);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRewardsCatalog", new { id = rewardsCatalog.RewardId }, rewardsCatalog);
        }

        // DELETE: api/RewardsCatalogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRewardsCatalog(int id)
        {
            var rewardsCatalog = await _context.RewardsCatalogs.FindAsync(id);
            if (rewardsCatalog == null)
            {
                return NotFound();
            }

            _context.RewardsCatalogs.Remove(rewardsCatalog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RewardsCatalogExists(int id)
        {
            return _context.RewardsCatalogs.Any(e => e.RewardId == id);
        }
    }
}
