using Microsoft.EntityFrameworkCore;
using PharmaSafe.Api.Data;
using PharmaSafe.Api.Models;

namespace PharmaSafe.Api.Services;

public class EscalationCheckService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EscalationCheckService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(30);
    private const int EscalationThresholdDays = 2;

    public EscalationCheckService(IServiceScopeFactory scopeFactory, ILogger<EscalationCheckService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckForAtRiskCasesAsync();
            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckForAtRiskCasesAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PharmaSafeDbContext>();

        var threshold = DateTime.UtcNow.AddDays(EscalationThresholdDays);

        var atRiskCases = await context.Cases
            .Where(c => !c.Escalated
                     && c.Status != CaseStatus.Closed
                     && c.Status != CaseStatus.Reported
                     && c.Deadline <= threshold)
            .ToListAsync();

        foreach (var caseItem in atRiskCases)
        {
            caseItem.Escalated = true;

            context.CaseHistoryEntries.Add(new CaseHistoryEntry
            {
                AdverseEventCaseId = caseItem.Id,
                Action = $"ESCALATED: Case is within {EscalationThresholdDays} days of regulatory deadline ({caseItem.Deadline:d}) and has not been reported.",
                PerformedByEmail = "system-escalation-job"
            });

            _logger.LogWarning(
                "Case {CaseId} escalated — deadline {Deadline}, status {Status}",
                caseItem.Id, caseItem.Deadline, caseItem.Status);
        }

        if (atRiskCases.Count > 0)
        {
            await context.SaveChangesAsync();
        }
    }
}