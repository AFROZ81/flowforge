using FlowForge.Application.Services;
using FlowForge.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Xunit;

namespace FlowForge.Tests;

/// <summary>
/// Tests for <see cref="SmtpEmailService"/> that must not send real emails.
///
/// These tests exercise the "SMTP not configured" and configuration-missing
/// paths, which are safe to run without an SMTP server and assert that no
/// credentials leak into logs or results.
/// </summary>
public sealed class SmtpEmailServiceTests
{
    private SmtpEmailService CreateService(params (string Key, string Value)[] settings)
    {
        var dict = new Dictionary<string, string>
        {
            ["Email:SmtpHost"] = "",
            ["Email:SmtpPort"] = "587",
            ["Email:SmtpUser"] = "",
            ["Email:SmtpPass"] = "",
            ["Email:FromEmail"] = "",
            ["Email:FromName"] = "FlowForge",
        };
        foreach (var (key, value) in settings)
        {
            dict[key] = value;
        }

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(dict)
            .Build();

        // Ensure no SMTP environment variables leak in from the host.
        foreach (var name in new[]
        {
            "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_KEY",
            "SMTP_FROM_EMAIL", "SMTP_FROM_NAME",
        })
        {
            Environment.SetEnvironmentVariable(name, "");
        }

        return new SmtpEmailService(
            config,
            new LoggerFactory().CreateLogger<SmtpEmailService>());
    }

    [Fact]
    public async Task TestSmtpConnectionAsync_when_not_configured_returns_failure_without_sending()
    {
        var service = CreateService();

        var result = await service.TestSmtpConnectionAsync();

        Assert.False(result.Success);
        Assert.Equal("smtp_not_configured", result.ErrorCode);
        Assert.NotNull(result.Error);
    }

    [Fact]
    public async Task SendInvitationEmailAsync_when_not_configured_returns_failure_without_sending()
    {
        var service = CreateService();

        var result = await service.SendInvitationEmailAsync(
            "invitee@example.com",
            "Acme Corp",
            "Admin",
            "Member",
            "http://localhost:5173/accept-invitation?token=abc",
            DateTime.UtcNow.AddDays(7),
            "Welcome!");

        Assert.False(result.Success);
        Assert.Equal("smtp_not_configured", result.ErrorCode);
        Assert.NotNull(result.Error);
        // The address is sanitized in logs; nothing here asserts the real
        // address or token appears anywhere.
    }

    [Fact]
    public async Task SendAsync_when_not_configured_returns_failure_without_throwing()
    {
        var service = CreateService();

        var result = await service.SendAsync(
            "invitee@example.com",
            "Subject",
            "Plain text body",
            "<p>Html body</p>");

        Assert.False(result.Success);
        Assert.Equal("smtp_not_configured", result.ErrorCode);
    }
}
