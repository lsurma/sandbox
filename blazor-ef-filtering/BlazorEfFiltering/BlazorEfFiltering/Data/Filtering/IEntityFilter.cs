using System.Linq.Expressions;

namespace BlazorEfFiltering.Data.Filtering;

public interface IEntityFilter<T>
{
    Expression<Func<T, bool>>? BuildExpression();
    bool HasValue { get; }
    void Reset();
}

public interface IEntityTextFilter<T> : IEntityFilter<T>
{
    string? Value { get; set; }
    TextFilterOperation Operation { get; set; }
}

public interface IEntityNumberFilter<T> : IEntityFilter<T>
{
    decimal? Value { get; set; }
    decimal? ValueTo { get; set; }
    NumberFilterOperation Operation { get; set; }
}

public interface IEntityDateFilter<T> : IEntityFilter<T>
{
    DateTime? Value { get; set; }
    DateTime? ValueTo { get; set; }
    DateFilterOperation Operation { get; set; }
}