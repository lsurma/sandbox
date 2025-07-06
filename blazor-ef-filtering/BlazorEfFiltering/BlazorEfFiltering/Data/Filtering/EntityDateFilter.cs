using System.Linq.Expressions;
using System.Reflection;

namespace BlazorEfFiltering.Data.Filtering;

public abstract class EntityDateFilter<T> : IEntityDateFilter<T>
{
    public abstract Expression<Func<T, object>> Property { get; }
    public DateTime? Value { get; set; }
    public DateTime? ValueTo { get; set; }
    public DateFilterOperation Operation { get; set; } = DateFilterOperation.Equals;
    public FilterType Type { get; set; } = FilterType.Date;

    public bool HasValue => Value.HasValue || (Operation == DateFilterOperation.Between && ValueTo.HasValue);

    public virtual Expression<Func<T, bool>>? BuildExpression()
    {
        if (!HasValue)
            return null;

        var parameter = Expression.Parameter(typeof(T), "x");
        var propertyExpression = GetPropertyExpression(parameter);

        Expression condition = Operation switch
        {
            DateFilterOperation.Equals when Value.HasValue => Expression.Equal(
                Expression.Property(propertyExpression, "Date"),
                Expression.Constant(Value.Value.Date)),
            
            DateFilterOperation.NotEquals when Value.HasValue => Expression.NotEqual(
                Expression.Property(propertyExpression, "Date"),
                Expression.Constant(Value.Value.Date)),
            
            DateFilterOperation.Before when Value.HasValue => Expression.LessThan(
                propertyExpression, 
                Expression.Constant(Value.Value)),
            
            DateFilterOperation.After when Value.HasValue => Expression.GreaterThan(
                propertyExpression, 
                Expression.Constant(Value.Value)),
            
            DateFilterOperation.Between when Value.HasValue && ValueTo.HasValue => Expression.AndAlso(
                Expression.GreaterThanOrEqual(propertyExpression, Expression.Constant(Value.Value)),
                Expression.LessThanOrEqual(propertyExpression, Expression.Constant(ValueTo.Value))
            ),
            
            _ when Value.HasValue => Expression.Equal(
                Expression.Property(propertyExpression, "Date"),
                Expression.Constant(Value.Value.Date))
        };

        return Expression.Lambda<Func<T, bool>>(condition, parameter);
    }

    private Expression GetPropertyExpression(ParameterExpression parameter)
    {
        var propertySelector = Property.Body;
        
        if (propertySelector is UnaryExpression unaryExpression && unaryExpression.NodeType == ExpressionType.Convert)
        {
            propertySelector = unaryExpression.Operand;
        }
        
        if (propertySelector is MemberExpression memberExpression)
        {
            var propertyInfo = memberExpression.Member as PropertyInfo;
            if (IsDateTimeType(propertyInfo?.PropertyType))
            {
                return Expression.Property(parameter, propertyInfo);
            }
        }

        throw new InvalidOperationException($"Property must be a DateTime property for date filtering");
    }

    private static bool IsDateTimeType(Type? type)
    {
        return type != null && (
            type == typeof(DateTime) || type == typeof(DateTime?) ||
            type == typeof(DateTimeOffset) || type == typeof(DateTimeOffset?) ||
            type == typeof(DateOnly) || type == typeof(DateOnly?)
        );
    }

    public virtual void Reset()
    {
        Value = null;
        ValueTo = null;
        Operation = DateFilterOperation.Equals;
    }
}