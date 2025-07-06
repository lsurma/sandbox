using EntityEntityWithAsyncMethods.Models;
using Microsoft.EntityFrameworkCore;

namespace EntityEntityWithAsyncMethods.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasOne(p => p.User)
                .WithMany(u => u.Products)
                .HasForeignKey(p => p.UserId);

            entity.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);
        });

        base.OnModelCreating(modelBuilder);
    }

    public async Task<List<User>> GetActiveUsersAsync()
    {
        return await Users.Where(u => u.IsActive).ToListAsync();
    }

    public async Task<List<Product>> GetProductsByCategoryAsync(int categoryId)
    {
        return await Products
            .Include(p => p.Category)
            .Include(p => p.User)
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync();
    }

    public async Task<User?> GetUserWithProductsAsync(int userId)
    {
        return await Users
            .Include(u => u.Products)
            .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<decimal> GetTotalRevenueAsync()
    {
        return await Products.SumAsync(p => p.Price * p.Stock);
    }

    public async Task<List<Category>> GetCategoriesWithProductCountAsync()
    {
        return await Categories
            .Include(c => c.Products)
            .ToListAsync();
    }
}