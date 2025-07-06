using System.Linq.Expressions;

namespace BlazorEfFiltering.Data.Filtering;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplyFilter<T>(this IQueryable<T> query, IEntityFilter<T> filter)
    {
        if (filter == null || !filter.HasValue)
            return query;

        var expression = filter.BuildExpression();
        if (expression == null)
            return query;

        return query.Where(expression);
    }

    public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, IEnumerable<IEntityFilter<T>> filters)
    {
        foreach (var filter in filters)
        {
            query = query.ApplyFilter(filter);
        }
        return query;
    }

    public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, params IEntityFilter<T>[] filters)
    {
        return query.ApplyFilters(filters.AsEnumerable());
    }

    public static IQueryable<Product> ApplyProductFilters(this IQueryable<Product> query, ProductFilters filters)
    {
        return query.ApplyFilters(filters.GetAllFilters());
    }

    public static IQueryable<Order> ApplyOrderFilters(this IQueryable<Order> query, OrderFilters filters)
    {
        return query.ApplyFilters(filters.GetAllFilters());
    }

    public static IQueryable<OrderItem> ApplyOrderItemFilters(this IQueryable<OrderItem> query, OrderItemFilters filters)
    {
        return query.ApplyFilters(filters.GetAllFilters());
    }

    public static IQueryable<T> ApplyDynamicFilters<T>(this IQueryable<T> query, object filtersContainer)
    {
        var containerType = filtersContainer.GetType();
        var filterProperties = containerType.GetProperties()
            .Where(p => typeof(IEntityFilter<T>).IsAssignableFrom(p.PropertyType));

        foreach (var property in filterProperties)
        {
            if (property.GetValue(filtersContainer) is IEntityFilter<T> filter)
            {
                query = query.ApplyFilter(filter);
            }
        }

        return query;
    }

    public static IQueryable<T> ApplyTextFilter<T>(this IQueryable<T> query, 
        Expression<Func<T, string>> property, 
        string? value, 
        TextFilterOperation operation = TextFilterOperation.Contains)
    {
        if (string.IsNullOrWhiteSpace(value))
            return query;

        var parameter = property.Parameters[0];
        var propertyExpression = property.Body;
        var valueExpression = Expression.Constant(value, typeof(string));

        Expression condition = operation switch
        {
            TextFilterOperation.Contains => Expression.Call(propertyExpression, "Contains", null, valueExpression),
            TextFilterOperation.StartsWith => Expression.Call(propertyExpression, "StartsWith", null, valueExpression),
            TextFilterOperation.EndsWith => Expression.Call(propertyExpression, "EndsWith", null, valueExpression),
            TextFilterOperation.Equals => Expression.Equal(propertyExpression, valueExpression),
            TextFilterOperation.NotEquals => Expression.NotEqual(propertyExpression, valueExpression),
            _ => Expression.Call(propertyExpression, "Contains", null, valueExpression)
        };

        var lambda = Expression.Lambda<Func<T, bool>>(condition, parameter);
        return query.Where(lambda);
    }

    public static IQueryable<T> ApplyNumberFilter<T>(this IQueryable<T> query,
        Expression<Func<T, decimal>> property,
        decimal? value,
        decimal? valueTo = null,
        NumberFilterOperation operation = NumberFilterOperation.Equals)
    {
        if (!value.HasValue && operation != NumberFilterOperation.Between)
            return query;

        var parameter = property.Parameters[0];
        var propertyExpression = property.Body;

        Expression condition = operation switch
        {
            NumberFilterOperation.Equals => Expression.Equal(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.NotEquals => Expression.NotEqual(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.GreaterThan => Expression.GreaterThan(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.LessThan => Expression.LessThan(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.GreaterThanOrEqual => Expression.GreaterThanOrEqual(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.LessThanOrEqual => Expression.LessThanOrEqual(propertyExpression, Expression.Constant(value)),
            NumberFilterOperation.Between when value.HasValue && valueTo.HasValue => Expression.AndAlso(
                Expression.GreaterThanOrEqual(propertyExpression, Expression.Constant(value)),
                Expression.LessThanOrEqual(propertyExpression, Expression.Constant(valueTo))
            ),
            _ => Expression.Equal(propertyExpression, Expression.Constant(value))
        };

        var lambda = Expression.Lambda<Func<T, bool>>(condition, parameter);
        return query.Where(lambda);
    }
}