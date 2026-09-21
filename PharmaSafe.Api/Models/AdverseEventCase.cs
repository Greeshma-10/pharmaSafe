namespace PharmaSafe.Api.Models;

public enum Severity
{
    NonSerious,
    Serious,
    LifeThreatening,
    Fatal
}

public enum CaseStatus
{
    New,
    UnderReview,
    PendingApproval,
    Reported,
    Closed
}

public class AdverseEventCase
{
    public int Id { get; set; }
    public string DrugName { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public CaseStatus Status { get; set; } = CaseStatus.New;
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public DateTime Deadline { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Escalated { get; set; } = false;

    // Foreign key
    public int? AssignedReviewerId { get; set; }
    public User? AssignedReviewer { get; set; }

    // Navigation
    public List<CaseHistoryEntry> History { get; set; } = new();
}