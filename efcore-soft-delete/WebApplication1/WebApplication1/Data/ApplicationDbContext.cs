using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;
using WebApplication1.Models;

namespace WebApplication1.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var propertyMethodInfo = typeof(EF).GetMethod(nameof(EF.Property), BindingFlags.Static | BindingFlags.Public)!.MakeGenericMethod(typeof(bool));
                var isDeletedProperty = Expression.Call(propertyMethodInfo, parameter, Expression.Constant("IsDeleted"));
                var compareExpression = Expression.MakeBinary(ExpressionType.Equal, isDeletedProperty, Expression.Constant(false));
                var lambda = Expression.Lambda(compareExpression, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        SeedData(modelBuilder);
        base.OnModelCreating(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Electronics", Description = "Electronic devices and gadgets", IsDeleted = false },
            new Category { Id = 2, Name = "Books", Description = "Physical and digital books", IsDeleted = false },
            new Category { Id = 3, Name = "Clothing", Description = "Fashion and apparel", IsDeleted = false },
            new Category { Id = 4, Name = "Toys", Description = "Children toys and games", IsDeleted = true },
            new Category { Id = 5, Name = "Sports", Description = "Sports equipment and gear", IsDeleted = true }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop", Price = 999.99m, IsDeleted = false },
            new Product { Id = 2, Name = "Smartphone", Price = 699.99m, IsDeleted = false },
            new Product { Id = 3, Name = "Tablet", Price = 299.99m, IsDeleted = false },
            new Product { Id = 4, Name = "Old Phone", Price = 199.99m, IsDeleted = true },
            new Product { Id = 5, Name = "Discontinued Laptop", Price = 1299.99m, IsDeleted = true },
            new Product { Id = 6, Name = "Headphones", Price = 149.99m, IsDeleted = false }
        );
    }
}