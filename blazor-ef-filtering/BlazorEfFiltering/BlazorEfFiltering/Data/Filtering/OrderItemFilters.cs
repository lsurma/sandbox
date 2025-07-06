using System.Linq.Expressions;

namespace BlazorEfFiltering.Data.Filtering;

public class OrderItemFilters
{
    public ProductName ProductNameFilter { get; set; } = new();
    public ProductCategory ProductCategoryFilter { get; set; } = new();
    public ProductPrice ProductPriceFilter { get; set; } = new();
    public Quantity QuantityFilter { get; set; } = new();
    public UnitPrice UnitPriceFilter { get; set; } = new();

    public class ProductName : EntityTextFilter<OrderItem>
    {
        public override Expression<Func<OrderItem, object>> Property => oi => oi.Product.Name;
    }

    public class ProductCategory : EntityTextFilter<OrderItem>
    {
        public override Expression<Func<OrderItem, object>> Property => oi => oi.Product.Category;
    }

    public class ProductPrice : EntityNumberFilter<OrderItem>
    {
        public override Expression<Func<OrderItem, object>> Property => oi => oi.Product.Price;
    }

    public class Quantity : EntityNumberFilter<OrderItem>
    {
        public override Expression<Func<OrderItem, object>> Property => oi => oi.Quantity;
    }

    public class UnitPrice : EntityNumberFilter<OrderItem>
    {
        public override Expression<Func<OrderItem, object>> Property => oi => oi.UnitPrice;
    }

    public IEnumerable<IEntityFilter<OrderItem>> GetAllFilters()
    {
        yield return ProductNameFilter;
        yield return ProductCategoryFilter;
        yield return ProductPriceFilter;
        yield return QuantityFilter;
        yield return UnitPriceFilter;
    }

    public void ResetAll()
    {
        foreach (var filter in GetAllFilters())
        {
            filter.Reset();
        }
    }
}