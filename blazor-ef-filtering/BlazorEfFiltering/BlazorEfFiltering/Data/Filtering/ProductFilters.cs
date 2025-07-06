using System.Linq.Expressions;

namespace BlazorEfFiltering.Data.Filtering;

public class ProductFilters
{
    public Name NameFilter { get; set; } = new();
    public Description DescriptionFilter { get; set; } = new();
    public Category CategoryFilter { get; set; } = new();
    public Price PriceFilter { get; set; } = new();
    public Stock StockFilter { get; set; } = new();

    public class Name : EntityTextFilter<Product>
    {
        public override Expression<Func<Product, object>> Property => p => p.Name;
    }

    public class Description : EntityTextFilter<Product>
    {
        public override Expression<Func<Product, object>> Property => p => p.Description;
    }

    public class Category : EntityTextFilter<Product>
    {
        public override Expression<Func<Product, object>> Property => p => p.Category;
    }

    public class Price : EntityNumberFilter<Product>
    {
        public override Expression<Func<Product, object>> Property => p => p.Price;
    }

    public class Stock : EntityNumberFilter<Product>
    {
        public override Expression<Func<Product, object>> Property => p => p.StockQuantity;
    }

    public IEnumerable<IEntityFilter<Product>> GetAllFilters()
    {
        yield return NameFilter;
        yield return DescriptionFilter;
        yield return CategoryFilter;
        yield return PriceFilter;
        yield return StockFilter;
    }

    public void ResetAll()
    {
        foreach (var filter in GetAllFilters())
        {
            filter.Reset();
        }
    }
}