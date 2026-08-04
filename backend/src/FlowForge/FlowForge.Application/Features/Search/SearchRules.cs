using FlowForge.Application.Interfaces;

namespace FlowForge.Application.Features.Search;

public sealed class SearchRules
{
    private readonly IApplicationDbContext _context;

    public SearchRules(IApplicationDbContext context)
    {
        _context = context;
    }
}