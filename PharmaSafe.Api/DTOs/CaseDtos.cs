using PharmaSafe.Api.Models;

namespace PharmaSafe.Api.DTOs;

public class CreateCaseDto
{
    public string DrugName { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public Severity Severity { get; set; }
}


public class CaseDto
{
    public int Id { get; set; }
    public string DrugName { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ReportedAt { get; set; }
    public DateTime Deadline { get; set; }
    public string? AssignedReviewerName { get; set; }
    public int DaysUntilDeadline { get; set; }
    public bool Escalated { get; set; }
}

public class UpdateCaseStatusDto
{
    public CaseStatus Status { get; set; }
}

public class AssignReviewerDto
{
    public int ReviewerId { get; set; }
}