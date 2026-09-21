using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaSafe.Api.Data;

namespace PharmaSafe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly PharmaSafeDbContext _context;

    public UsersController(PharmaSafeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var users = await _context.Users
            .Where(u => u.Role == "SafetyReviewer" || u.Role == "QAApprover")
            .Select(u => new { u.Id, u.Name, u.Role })
            .ToListAsync();

        return Ok(users);
    }
}