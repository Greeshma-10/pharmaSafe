using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaSafe.Api.Data;
using PharmaSafe.Api.Models;
using PharmaSafe.Api.Controllers;
using PharmaSafe.Api.DTOs;
using System.Security.Claims;
using Xunit;

// CI trigger verification
namespace PharmaSafe.Api.Tests;

public class CaseDeadlineTests
{
    private static PharmaSafeDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PharmaSafeDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new PharmaSafeDbContext(options);
    }

    private static CasesController CreateControllerWithFakeUser(PharmaSafeDbContext context)
    {
        var controller = new CasesController(context);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, "test-user@pharmasafe.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        return controller;
    }

    [Theory]
    [InlineData(Severity.Fatal, 7)]
    [InlineData(Severity.LifeThreatening, 7)]
    [InlineData(Severity.Serious, 15)]
    [InlineData(Severity.NonSerious, 90)]
    public async Task Create_SetsCorrectDeadline_BasedOnSeverity(Severity severity, int expectedDays)
    {
        using var context = CreateContext();
        var controller = CreateControllerWithFakeUser(context);

        var input = new CreateCaseDto
        {
            DrugName = "TestDrug",
            EventDescription = "Test event description",
            Severity = severity
        };

        await controller.Create(input);

        var createdCase = await context.Cases.FirstAsync();
        var expectedDeadline = createdCase.ReportedAt.AddDays(expectedDays);

        Assert.Equal(expectedDeadline.Date, createdCase.Deadline.Date);
    }

    [Fact]
    public async Task Create_SetsInitialStatusToNew()
    {
        using var context = CreateContext();
        var controller = CreateControllerWithFakeUser(context);

        var input = new CreateCaseDto
        {
            DrugName = "TestDrug",
            EventDescription = "Test event description",
            Severity = Severity.Serious
        };

        await controller.Create(input);

        var createdCase = await context.Cases.FirstAsync();
        Assert.Equal(CaseStatus.New, createdCase.Status);
    }
}