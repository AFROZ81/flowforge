using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Webhooks.TestWebhook;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Webhooks;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Webhooks.TestWebhook;

/// <summary>
/// Handles <see cref="TestWebhookCommand"/>.
/// </summary>
public sealed class TestWebhookCommandHandler : IRequestHandler<TestWebhookCommand, TestWebhookResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IWebhookService _webhookService;

    public TestWebhookCommandHandler(
        IApplicationDbContext context,
        IWebhookService webhookService)
    {
        _context = context;
        _webhookService = webhookService;
    }

    public async Task<TestWebhookResponse> Handle(TestWebhookCommand request, CancellationToken cancellationToken)
    {
        return await _webhookService.TestAsync(request.Id, cancellationToken);
    }
}