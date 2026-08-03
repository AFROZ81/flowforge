using FluentValidation;

namespace FlowForge.Application.Features.Search.WorkItems;

public sealed class SearchWorkItemsValidator : AbstractValidator<SearchWorkItemsQuery>
{
    public SearchWorkItemsValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}