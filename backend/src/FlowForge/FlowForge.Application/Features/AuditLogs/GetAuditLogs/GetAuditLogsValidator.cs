using FluentValidation;

namespace FlowForge.Application.Features.AuditLogs.GetAuditLogs;

/// <summary>
/// Validator for <see cref="GetAuditLogsRequest"/>.
/// </summary>
public sealed class GetAuditLogsValidator : AbstractValidator<GetAuditLogsRequest>
{
    public GetAuditLogsValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("Organization ID is required.");

        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0.")
            .LessThanOrEqualTo(1000).WithMessage("Page must not exceed 1000.");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0.")
            .LessThanOrEqualTo(100).WithMessage("Page size must not exceed 100.");

        RuleFor(x => x.SortBy)
            .NotEmpty().WithMessage("Sort by is required.")
            .Must(BeValidSortField).WithMessage("Invalid sort field.");

        RuleFor(x => x.PageSize)
            .LessThanOrEqualTo(100).WithMessage("Page size must not exceed 100.")
            .When(x => x.PageSize > 0);
    }

    private static bool BeValidSortField(string sortBy)
    {
        var validFields = new[]
        {
            "CreatedAt",
            "Type",
            "Action",
            "ActorName",
            "TargetEntityType",
            "TargetEntityId",
            "ActorName",
            "ActorIpAddress"
        };

        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }
}