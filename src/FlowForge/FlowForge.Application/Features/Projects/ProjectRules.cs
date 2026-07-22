using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Projects;

public sealed class ProjectRules
{
    private readonly IApplicationDbContext _context;

    public ProjectRules(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Project> GetByIdAsync(Guid projectId, Guid organizationId, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(x =>
                x.Id == projectId &&
                x.OrganizationId == organizationId,
                cancellationToken);

        if (project is null)
            throw new NotFoundException("Project not found.");

        return project;
    }

    public async Task EnsureNameUniqueAsync(string name, Guid organizationId, Guid? ignoreProjectId, CancellationToken cancellationToken)
    {
        var exists = await _context.Projects.AnyAsync(x =>
            x.OrganizationId == organizationId &&
            x.Name == name &&
            (!ignoreProjectId.HasValue || x.Id != ignoreProjectId.Value),
            cancellationToken);

        if (exists)
            throw new BadRequestException("A project with this name already exists.");
    }

    public void EnsureNotArchived(Project project)
    {
        if (project.IsArchived)
            throw new BadRequestException("Project is already archived.");
    }

    public void EnsureArchived(Project project)
    {
        if (!project.IsArchived)
            throw new BadRequestException("Project is not archived.");
    }
}