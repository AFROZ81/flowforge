using System.Linq.Expressions;

namespace FlowForge.Application.Common.Pagination;

public static class SortingExtensions
{
    public static IQueryable<T> ApplySorting<T>(this IQueryable<T> query, string? sortBy, bool descending, Dictionary<string, Expression<Func<T, object>>> sortExpressions, Expression<Func<T, object>> defaultSort)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            return descending ? query.OrderByDescending(defaultSort) : query.OrderBy(defaultSort);
        }

        if (!sortExpressions.TryGetValue(sortBy.ToLower(), out var expression))
        {
            expression = defaultSort;
        }

        return descending ? query.OrderByDescending(expression) : query.OrderBy(expression);
    }
}