namespace PharmaSafe.Api.Models;

public class CaseHistoryEntry
{
    public int Id { get; set; }
    public int AdverseEventCaseId { get; set; }
    public AdverseEventCase? AdverseEventCase { get; set; }

    public string Action { get; set; } = string.Empty; // e.g. "Status changed to UnderReview"
    public string PerformedByEmail { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}