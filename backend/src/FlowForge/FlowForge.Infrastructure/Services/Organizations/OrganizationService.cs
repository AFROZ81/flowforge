using FlowForge.Application.Features.Organizations.CreateOrganization;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Organizations;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.Organizations;

/// <summary>
/// Handles organization-related business operations.
/// </summary>
public sealed class OrganizationService : IOrganizationService
{
    private readonly IApplicationDbContext _context;

    public OrganizationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateOrganizationResponse> CreateAsync(CreateOrganizationRequest request, CancellationToken cancellationToken = default)
    {
        // Check if the slug already exists.
        bool slugExists = await _context.Organizations.AnyAsync(x => x.Slug == request.Slug, cancellationToken);

        if (slugExists)
        {
            throw new InvalidOperationException($"An organization with slug '{request.Slug}' already exists.");
        }

        // Create the entity.
        Organization organization = new()
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            IsActive = true
        };

        // Save.
        _context.Organizations.Add(organization);

        await _context.SaveChangesAsync(cancellationToken);

        // Return response.
        return new CreateOrganizationResponse
        {
            Id = organization.Id,
            Name = organization.Name,
            Slug = organization.Slug
        };
    }
}