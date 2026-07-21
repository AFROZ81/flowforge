using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using FlowForge.Application.Common.Exceptions;
using MediatR;

namespace FlowForge.Application.Features.Projects.Create;

public sealed class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, CreateProjectResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateProjectCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateProjectResponse> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var exists = await _context.Projects.AnyAsync(
            x =>
                x.OrganizationId == currentUser.OrganizationId &&
                x.Key == request.Key,
            cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                "A project with this key already exists.");
        }

        var project = new Project(
            currentUser.OrganizationId,
            request.Name,
            request.Key,
            request.Description,
            request.Color,
            request.Icon);

        _context.Projects.Add(project);

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Key = project.Key
        };
    }
}