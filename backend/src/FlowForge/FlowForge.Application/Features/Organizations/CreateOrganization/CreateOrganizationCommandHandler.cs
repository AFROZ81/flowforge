using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Organizations.CreateOrganization;

public sealed class CreateOrganizationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    ITokenService tokenService,
    IAuditLogService auditLogService)
    : IRequestHandler<CreateOrganizationRequest, CreateOrganizationResponse>
{
    public async Task<CreateOrganizationResponse> Handle(
        CreateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var user = currentUser.TryGetUser()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var slug = request.Slug.Trim().ToLowerInvariant();

        var slugExists = await context.Organizations
            .AnyAsync(x => x.Slug == slug, cancellationToken);

        if (slugExists)
            throw new ConflictException($"An organization with slug '{slug}' already exists.");

        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            IsActive = true
        };

        var membership = new OrganizationUser
        {
            UserId = user.UserId,
            OrganizationId = organization.Id,
            Role = UserRole.Admin,
            IsOwner = true,
            TokenVersion = 0
        };

        await context.ExecuteInTransactionAsync(async () =>
        {
            context.Organizations.Add(organization);
            context.OrganizationUsers.Add(membership);
            await context.SaveChangesAsync(cancellationToken);

            await auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.OrganizationCreated,
                OrganizationId = organization.Id,
                ActorId = user.UserId,
                ActorName = user.FullName,
                TargetEntityId = organization.Id,
                TargetEntityType = "Organization",
                Action = "OrganizationCreated",
                Description = $"Created organization {organization.Name}.",
                NewValuesJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    organization.Name,
                    organization.Slug
                })
            }, cancellationToken);
        }, cancellationToken);

        var token = tokenService.GenerateAccessToken(new AuthenticatedUser
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            OrganizationId = organization.Id,
            MembershipId = membership.Id,
            TokenVersion = membership.TokenVersion,
            OrganizationIds = [organization.Id],
            Role = UserRole.Admin
        });

        return new CreateOrganizationResponse
        {
            Id = organization.Id,
            Name = organization.Name,
            Slug = organization.Slug,
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc,
            OrganizationId = organization.Id
        };
    }
}
