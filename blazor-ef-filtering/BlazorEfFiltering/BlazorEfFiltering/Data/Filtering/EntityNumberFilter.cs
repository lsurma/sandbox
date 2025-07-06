using System.Linq.Expressions;
using System.Reflection;

namespace BlazorEfFiltering.Data.Filtering;

public abstract class EntityNumberFilter<T> : IEntityNumberFilter<T>
{
    public abstract Expression<Func<T, object>> Property { get; }
    public decimal? Value { get; set; }
    public decimal? ValueTo { get; set; }
    public NumberFilterOperation Operation { get; set; } = NumberFilterOperation.Equals;
    public FilterType Type { get; set; } = FilterType.Number;

    public bool HasValue => Value.HasValue || (Operation == NumberFilterOperation.Between && ValueTo.HasValue);

    public virtual Expression<Func<T, bool>>? BuildExpression()
    {
        if (!HasValue)
            return null;

        // Use the original parameter name from the Property expression
        var originalParameter = Property.Parameters[0];
        var parameter = Expression.Parameter(typeof(T), originalParameter.Name);
        
        // Get the property expression body, handling boxing if needed
        var propertyBody = Property.Body;
        if (propertyBody is UnaryExpression unary && unary.NodeType == ExpressionType.Convert)
        {
            propertyBody = unary.Operand;
        }

        // Replace the original parameter with our new parameter (same name, fresh instance)
        var replacedPropertyBody = new ParameterReplacer(originalParameter, parameter).Visit(propertyBody);

        Expression condition = Operation switch
        {
            NumberFilterOperation.Equals => Expression.Equal(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.NotEquals => Expression.NotEqual(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.GreaterThan => Expression.GreaterThan(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.LessThan => Expression.LessThan(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.GreaterThanOrEqual => Expression.GreaterThanOrEqual(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.LessThanOrEqual => Expression.LessThanOrEqual(replacedPropertyBody, Expression.Constant(Value)),
            NumberFilterOperation.Between when Value.HasValue && ValueTo.HasValue => Expression.AndAlso(
                Expression.GreaterThanOrEqual(replacedPropertyBody, Expression.Constant(Value)),
                Expression.LessThanOrEqual(replacedPropertyBody, Expression.Constant(ValueTo))
            ),
            _ => Expression.Equal(replacedPropertyBody, Expression.Constant(Value))
        };

        return Expression.Lambda<Func<T, bool>>(condition, parameter);
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _oldParameter;
        private readonly ParameterExpression _newParameter;

        public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _oldParameter = oldParameter;
            _newParameter = newParameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _oldParameter ? _newParameter : node;
        }
    }

    private static bool IsNumericType(Type? type)
    {
        return type != null && (
            type == typeof(int) || type == typeof(long) || type == typeof(decimal) ||
            type == typeof(double) || type == typeof(float) || type == typeof(short) ||
            type == typeof(byte) || type == typeof(uint) || type == typeof(ulong) ||
            type == typeof(ushort) || type == typeof(sbyte) ||
            type == typeof(int?) || type == typeof(long?) || type == typeof(decimal?) ||
            type == typeof(double?) || type == typeof(float?) || type == typeof(short?) ||
            type == typeof(byte?) || type == typeof(uint?) || type == typeof(ulong?) ||
            type == typeof(ushort?) || type == typeof(sbyte?)
        );
    }

    public virtual void Reset()
    {
        Value = null;
        ValueTo = null;
        Operation = NumberFilterOperation.Equals;
    }
}