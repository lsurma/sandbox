using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using EntityEntityWithAsyncMethods.Data;
using EntityEntityWithAsyncMethods.Models;

namespace EntityEntityWithAsyncMethods.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;

    public IndexModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public List<User> ActiveUsers { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
    public decimal TotalRevenue { get; set; }

    public async Task OnGetAsync()
    {
        ActiveUsers = await _context.GetActiveUsersAsync();
        Categories = await _context.GetCategoriesWithProductCountAsync();
        TotalRevenue = await _context.GetTotalRevenueAsync();
    }
}