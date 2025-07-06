using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using EntityEntityWithAsyncMethods.Services;
using EntityEntityWithAsyncMethods.Models;

namespace EntityEntityWithAsyncMethods.Pages;

public class UserWrapperModel : PageModel
{
    private readonly IUserWrapperFactory _userWrapperFactory;
    private readonly ILogger<UserWrapperModel> _logger;

    public UserWrapperModel(IUserWrapperFactory userWrapperFactory, ILogger<UserWrapperModel> logger)
    {
        _userWrapperFactory = userWrapperFactory;
        _logger = logger;
    }

    public List<UserWrapper> AllUserWrappers { get; set; } = new();
    public UserWrapper? SelectedUserWrapper { get; set; }
    public int ProductCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AveragePrice { get; set; }
    public bool HasStock { get; set; }
    public Product? MostExpensiveProduct { get; set; }
    public Product? LatestProduct { get; set; }
    public Dictionary<string, int> ProductsByCategory { get; set; } = new();
    public List<Product> LowStockProducts { get; set; } = new();

    public async Task OnGetAsync(int? userId)
    {
        _logger.LogInformation("Loading UserWrapper demo page with userId: {UserId}", userId);

        // Load all active user wrappers
        AllUserWrappers = await _userWrapperFactory.CreateActiveUserWrappersAsync();

        // If no userId specified, use the first user
        if (!userId.HasValue && AllUserWrappers.Any())
        {
            userId = AllUserWrappers.First().Id;
        }

        // Load selected user wrapper if userId is specified
        if (userId.HasValue)
        {
            SelectedUserWrapper = await _userWrapperFactory.CreateUserWrapperAsync(userId.Value);
            
            if (SelectedUserWrapper != null)
            {
                await LoadUserDetailsAsync(SelectedUserWrapper);
            }
        }
    }

    private async Task LoadUserDetailsAsync(UserWrapper userWrapper)
    {
        _logger.LogInformation("Loading details for user {UserId}", userWrapper.Id);

        try
        {
            // Load all the async data for the selected user
            var tasks = new List<Task>
            {
                LoadProductCountAsync(userWrapper),
                LoadTotalRevenueAsync(userWrapper),
                LoadAveragePriceAsync(userWrapper),
                LoadHasStockAsync(userWrapper),
                LoadMostExpensiveProductAsync(userWrapper),
                LoadLatestProductAsync(userWrapper),
                LoadProductsByCategoryAsync(userWrapper),
                LoadLowStockProductsAsync(userWrapper)
            };

            await Task.WhenAll(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading user details for user {UserId}", userWrapper.Id);
        }
    }

    private async Task LoadProductCountAsync(UserWrapper userWrapper)
    {
        ProductCount = await userWrapper.GetProductCountAsync();
    }

    private async Task LoadTotalRevenueAsync(UserWrapper userWrapper)
    {
        TotalRevenue = await userWrapper.GetTotalRevenueAsync();
    }

    private async Task LoadAveragePriceAsync(UserWrapper userWrapper)
    {
        AveragePrice = await userWrapper.GetAverageProductPriceAsync();
    }

    private async Task LoadHasStockAsync(UserWrapper userWrapper)
    {
        HasStock = await userWrapper.HasProductsInStockAsync();
    }

    private async Task LoadMostExpensiveProductAsync(UserWrapper userWrapper)
    {
        MostExpensiveProduct = await userWrapper.GetMostExpensiveProductAsync();
    }

    private async Task LoadLatestProductAsync(UserWrapper userWrapper)
    {
        LatestProduct = await userWrapper.GetLatestProductAsync();
    }

    private async Task LoadProductsByCategoryAsync(UserWrapper userWrapper)
    {
        ProductsByCategory = await userWrapper.GetProductCountByCategoryAsync();
    }

    private async Task LoadLowStockProductsAsync(UserWrapper userWrapper)
    {
        LowStockProducts = await userWrapper.GetLowStockProductsAsync();
    }
}