using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaSafe.Api.Data;
using PharmaSafe.Api.Models;
using PharmaSafe.Api.DTOs;
using PharmaSafe.Api.Services;

namespace PharmaSafe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PharmaSafeDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(PharmaSafeDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto input)
    {
        var emailTaken = await _context.Users.AnyAsync(u => u.Email == input.Email);
        if (emailTaken)
        {
            return BadRequest("Email is already registered.");
        }

        var user = new User
        {
            Name = input.Name,
            Email = input.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password),
            Role = input.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto input)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == input.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        });
    }
}