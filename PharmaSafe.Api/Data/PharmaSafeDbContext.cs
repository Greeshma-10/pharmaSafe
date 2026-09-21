using Microsoft.EntityFrameworkCore;
using PharmaSafe.Api.Models;

namespace PharmaSafe.Api.Data;

public class PharmaSafeDbContext : DbContext
{
    public PharmaSafeDbContext(DbContextOptions<PharmaSafeDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<AdverseEventCase> Cases { get; set; }
    public DbSet<CaseHistoryEntry> CaseHistoryEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdverseEventCase>()
            .Property(c => c.Severity)
            .HasConversion<string>();

        modelBuilder.Entity<AdverseEventCase>()
            .Property(c => c.Status)
            .HasConversion<string>();
    }
}