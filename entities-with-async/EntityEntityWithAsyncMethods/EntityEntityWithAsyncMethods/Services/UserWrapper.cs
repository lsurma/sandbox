using EntityEntityWithAsyncMethods.Data;
using EntityEntityWithAsyncMethods.Models;
using Microsoft.EntityFrameworkCore;

namespace EntityEntityWithAsyncMethods.Services;

public class UserWrapper
{
    private readonly User _user;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserWrapper> _logger;

    public UserWrapper(User user, ApplicationDbContext context, ILogger<UserWrapper> logger)
    {
        _user = user ?? throw new ArgumentNullException(nameof(user));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public int Id => _user.Id;
    public string Name => _user.Name;
    public string Email => _user.Email;
    public DateTime CreatedAt => _user.CreatedAt;
    public bool IsActive => _user.IsActive;

    public async Task<List<Product>> GetProductsAsync()
    {
        _logger.LogInformation("Fetching products for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .Include(p => p.Category)
            .ToListAsync();
    }

    public async Task<int> GetProductCountAsync()
    {
        _logger.LogInformation("Counting products for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .CountAsync();
    }

    public async Task<decimal> GetTotalRevenueAsync()
    {
        _logger.LogInformation("Calculating total revenue for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .SumAsync(p => p.Price * p.Stock);
    }

    public async Task<Product?> GetMostExpensiveProductAsync()
    {
        _logger.LogInformation("Finding most expensive product for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .Include(p => p.Category)
            .OrderByDescending(p => p.Price)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Product>> GetProductsByCategoryAsync(int categoryId)
    {
        _logger.LogInformation("Fetching products by category {CategoryId} for user {UserId}", categoryId, _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id && p.CategoryId == categoryId)
            .Include(p => p.Category)
            .ToListAsync();
    }

    public async Task<Dictionary<string, int>> GetProductCountByCategoryAsync()
    {
        _logger.LogInformation("Getting product count by category for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .Include(p => p.Category)
            .GroupBy(p => p.Category.Name)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<bool> HasProductsInStockAsync()
    {
        _logger.LogInformation("Checking if user {UserId} has products in stock", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id && p.Stock > 0)
            .AnyAsync();
    }

    public async Task<Product?> GetLatestProductAsync()
    {
        _logger.LogInformation("Getting latest product for user {UserId}", _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id)
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Product>> GetLowStockProductsAsync(int threshold = 10)
    {
        _logger.LogInformation("Getting low stock products (threshold: {Threshold}) for user {UserId}", threshold, _user.Id);
        
        return await _context.Products
            .Where(p => p.UserId == _user.Id && p.Stock <= threshold)
            .Include(p => p.Category)
            .OrderBy(p => p.Stock)
            .ToListAsync();
    }

    public async Task<decimal> GetAverageProductPriceAsync()
    {
        _logger.LogInformation("Calculating average product price for user {UserId}", _user.Id);
        
        var products = await _context.Products
            .Where(p => p.UserId == _user.Id)
            .ToListAsync();

        return products.Any() ? products.Average(p => p.Price) : 0;
    }

    public User GetEntity() => _user;
}