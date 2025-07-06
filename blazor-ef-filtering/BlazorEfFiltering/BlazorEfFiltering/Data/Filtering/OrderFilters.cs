using System.Linq.Expressions;

namespace BlazorEfFiltering.Data.Filtering;

public class OrderFilters
{
    public CustomerName CustomerNameFilter { get; set; } = new();
    public CustomerEmail CustomerEmailFilter { get; set; } = new();
    public Status StatusFilter { get; set; } = new();
    public TotalAmount TotalAmountFilter { get; set; } = new();
    public OrderDate OrderDateFilter { get; set; } = new();

    public class CustomerName : EntityTextFilter<Order>
    {
        public override Expression<Func<Order, object>> Property => o => o.CustomerName;
    }

    public class CustomerEmail : EntityTextFilter<Order>
    {
        public override Expression<Func<Order, object>> Property => o => o.CustomerEmail;
    }

    public class Status : EntityTextFilter<Order>
    {
        public override Expression<Func<Order, object>> Property => o => o.Status;
    }

    public class TotalAmount : EntityNumberFilter<Order>
    {
        public override Expression<Func<Order, object>> Property => o => o.TotalAmount;
    }

    public class OrderDate : EntityDateFilter<Order>
    {
        public override Expression<Func<Order, object>> Property => o => o.OrderDate;
    }

    public IEnumerable<IEntityFilter<Order>> GetAllFilters()
    {
        yield return CustomerNameFilter;
        yield return CustomerEmailFilter;
        yield return StatusFilter;
        yield return TotalAmountFilter;
        yield return OrderDateFilter;
    }

    public void ResetAll()
    {
        foreach (var filter in GetAllFilters())
        {
            filter.Reset();
        }
    }
}