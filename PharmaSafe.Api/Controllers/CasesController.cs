using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PharmaSafe.Api.Data;
using PharmaSafe.Api.Models;
using PharmaSafe.Api.DTOs;

namespace PharmaSafe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CasesController : ControllerBase
{
    private readonly PharmaSafeDbContext _context;

    public CasesController(PharmaSafeDbContext context)
    {
        _context = context;
    }

    private string GetCurrentUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
    }

    private static DateTime CalculateDeadline(DateTime reportedAt, Severity severity)
    {
        return severity switch
        {
            Severity.Fatal => reportedAt.AddDays(7),
            Severity.LifeThreatening => reportedAt.AddDays(7),
            Severity.Serious => reportedAt.AddDays(15),
            Severity.NonSerious => reportedAt.AddDays(90),
            _ => reportedAt.AddDays(15)
        };
    }

    private CaseDto ToDto(AdverseEventCase c)
{
    return new CaseDto
    {
        Id = c.Id,
        DrugName = c.DrugName,
        EventDescription = c.EventDescription,
        Severity = c.Severity.ToString(),
        Status = c.Status.ToString(),
        ReportedAt = c.ReportedAt,
        Deadline = c.Deadline,
        AssignedReviewerName = c.AssignedReviewer?.Name,
        DaysUntilDeadline = (int)(c.Deadline - DateTime.UtcNow).TotalDays,
        Escalated = c.Escalated
    };
}

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetAll()
    {
        var cases = await _context.Cases
            .Include(c => c.AssignedReviewer)
            .ToListAsync();

        return Ok(cases.Select(ToDto));
    }

    [HttpGet("summary")]
    [Authorize]
    public async Task<ActionResult<object>> GetSummary()
    {
        var cases = await _context.Cases.ToListAsync();

        var byStatus = cases
            .GroupBy(c => c.Status.ToString())
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToList();

        var bySeverity = cases
            .GroupBy(c => c.Severity.ToString())
            .Select(g => new { severity = g.Key, count = g.Count() })
            .ToList();

        var atRiskCount = cases.Count(c => c.Escalated && c.Status != CaseStatus.Closed && c.Status != CaseStatus.Reported);
        var totalOpen = cases.Count(c => c.Status != CaseStatus.Closed);

        return Ok(new
        {
            totalCases = cases.Count,
            totalOpen,
            atRiskCount,
            byStatus,
            bySeverity
        });
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<CaseDto>> GetById(int id)
    {
        var caseItem = await _context.Cases
            .Include(c => c.AssignedReviewer)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (caseItem == null)
        {
            return NotFound();
        }

        return Ok(ToDto(caseItem));
    }

    [HttpGet("{id}/history")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetHistory(int id)
    {
        var exists = await _context.Cases.AnyAsync(c => c.Id == id);
        if (!exists)
        {
            return NotFound();
        }

        var history = await _context.CaseHistoryEntries
            .Where(h => h.AdverseEventCaseId == id)
            .OrderBy(h => h.Timestamp)
            .Select(h => new
            {
                h.Action,
                h.PerformedByEmail,
                h.Timestamp
            })
            .ToListAsync();

        return Ok(history);
    }

    [HttpPost]
    [Authorize(Roles = "IntakeCoordinator")]
    public async Task<ActionResult<CaseDto>> Create(CreateCaseDto input)
    {
        var reportedAt = DateTime.UtcNow;

        var caseItem = new AdverseEventCase
        {
            DrugName = input.DrugName,
            EventDescription = input.EventDescription,
            Severity = input.Severity,
            Status = CaseStatus.New,
            ReportedAt = reportedAt,
            Deadline = CalculateDeadline(reportedAt, input.Severity)
        };

        _context.Cases.Add(caseItem);
        await _context.SaveChangesAsync();

        _context.CaseHistoryEntries.Add(new CaseHistoryEntry
        {
            AdverseEventCaseId = caseItem.Id,
            Action = $"Case created with severity {input.Severity}, deadline set to {caseItem.Deadline:d}",
            PerformedByEmail = GetCurrentUserEmail()
        });
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = caseItem.Id }, ToDto(caseItem));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "SafetyReviewer,QAApprover")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateCaseStatusDto input)
    {
        var caseItem = await _context.Cases.FindAsync(id);
        if (caseItem == null)
        {
            return NotFound();
        }

        var oldStatus = caseItem.Status;
        caseItem.Status = input.Status;
        await _context.SaveChangesAsync();

        _context.CaseHistoryEntries.Add(new CaseHistoryEntry
        {
            AdverseEventCaseId = caseItem.Id,
            Action = $"Status changed from {oldStatus} to {input.Status}",
            PerformedByEmail = GetCurrentUserEmail()
        });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/assign")]
[Authorize(Roles = "SafetyReviewer,QAApprover")]
public async Task<IActionResult> AssignReviewer(int id, AssignReviewerDto input)
{
    var caseItem = await _context.Cases.FindAsync(id);
    if (caseItem == null)
    {
        return NotFound();
    }

    var reviewer = await _context.Users.FirstOrDefaultAsync(u => u.Id == input.ReviewerId);
    if (reviewer == null)
    {
        return BadRequest($"User with id {input.ReviewerId} does not exist.");
    }

    caseItem.AssignedReviewerId = input.ReviewerId;
    if (caseItem.Status == CaseStatus.New)
    {
        caseItem.Status = CaseStatus.UnderReview;
    }
    await _context.SaveChangesAsync();

    _context.CaseHistoryEntries.Add(new CaseHistoryEntry
    {
        AdverseEventCaseId = caseItem.Id,
        Action = $"Assigned to reviewer {reviewer.Name} ({reviewer.Role})",
        PerformedByEmail = GetCurrentUserEmail()
    });
    await _context.SaveChangesAsync();

    return NoContent();
}
    

    
}