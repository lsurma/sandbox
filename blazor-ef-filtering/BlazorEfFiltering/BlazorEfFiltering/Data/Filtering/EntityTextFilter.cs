using System.Linq.Expressions;
using System.Reflection;

namespace BlazorEfFiltering.Data.Filtering;

public abstract class EntityTextFilter<T> : IEntityTextFilter<T>
{
    public abstract Expression<Func<T, object>> Property { get; }
    public string? Value { get; set; }
    public TextFilterOperation Operation { get; set; } = TextFilterOperation.Contains;
    public FilterType Type { get; set; } = FilterType.Text;

    public bool HasValue => !string.IsNullOrWhiteSpace(Value);

    public virtual Expression<Func<T, bool>>? BuildExpression()
    {
        if (!HasValue || string.IsNullOrWhiteSpace(Value))
            return null;

        var originalParameter = Property.Parameters[0];
        var newParameter = Expression.Parameter(typeof(T), originalParameter.Name);

        // Replace parameter in property expression
        var replacedBody = new ParameterReplacer(originalParameter, newParameter).Visit(Property.Body)!;

        // Ensure we're operating on a string (cast if needed)
        Expression stringExpression = replacedBody.Type == typeof(string)
            ? replacedBody
            : Expression.Convert(replacedBody, typeof(string));

        var methodValue = Expression.Constant(Value, typeof(string));

        // Make sure to check for null before calling string methods
        var notNull = Expression.NotEqual(stringExpression, Expression.Constant(null, typeof(string)));

        Expression methodCall = Operation switch
        {
            TextFilterOperation.Contains =>
                Expression.Call(stringExpression, nameof(string.Contains), null, methodValue),

            TextFilterOperation.StartsWith =>
                Expression.Call(stringExpression, nameof(string.StartsWith), null, methodValue),

            TextFilterOperation.EndsWith =>
                Expression.Call(stringExpression, nameof(string.EndsWith), null, methodValue),

            TextFilterOperation.Equals =>
                Expression.Equal(stringExpression, methodValue),

            TextFilterOperation.NotEquals =>
                Expression.NotEqual(stringExpression, methodValue),

            _ =>
                Expression.Call(stringExpression, nameof(string.Contains), null, methodValue)
        };

        var finalExpression = Expression.AndAlso(notNull, methodCall);

        return Expression.Lambda<Func<T, bool>>(finalExpression, newParameter);
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

    public virtual void Reset()
    {
        Value = null;
        Operation = TextFilterOperation.Contains;
    }
}