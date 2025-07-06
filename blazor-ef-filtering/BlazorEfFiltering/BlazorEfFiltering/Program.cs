using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using BlazorEfFiltering.Components;
using BlazorEfFiltering.Components.Account;
using BlazorEfFiltering.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityUserAccessor>();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

builder.Services.AddAuthentication(options => {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();

var app = builder.Build();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
    
    // Seed data if needed
    await SeedData(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Add additional endpoints required by the Identity /Account Razor components.
app.MapAdditionalIdentityEndpoints();

app.Run();

static async Task SeedData(ApplicationDbContext context)
{
    // Check if data already exists
    if (context.Products.Any() || context.Orders.Any())
        return;

    // Create random products
    var products = new List<Product>();
    var categories = new[] { "Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys" };
    var random = new Random();

    for (int i = 1; i <= 20; i++)
    {
        products.Add(new Product
        {
            Name = $"Product {i}",
            Description = $"Description for product {i}",
            Price = Math.Round((decimal)(random.NextDouble() * 1000 + 10), 2),
            StockQuantity = random.Next(10, 100),
            Category = categories[random.Next(categories.Length)],
            CreatedAt = DateTime.UtcNow.AddDays(-random.Next(30))
        });
    }

    context.Products.AddRange(products);
    await context.SaveChangesAsync();

    // Create random orders
    var orders = new List<Order>();
    var statuses = new[] { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };
    var customers = new[]
    {
        ("John Doe", "john@example.com"),
        ("Jane Smith", "jane@example.com"),
        ("Bob Johnson", "bob@example.com"),
        ("Alice Brown", "alice@example.com"),
        ("Charlie Wilson", "charlie@example.com")
    };

    for (int i = 1; i <= 5; i++)
    {
        var customer = customers[random.Next(customers.Length)];
        var order = new Order
        {
            CustomerName = customer.Item1,
            CustomerEmail = customer.Item2,
            OrderDate = DateTime.UtcNow.AddDays(-random.Next(15)),
            Status = statuses[random.Next(statuses.Length)],
            ShippingAddress = $"123 Street {i}, City, State 12345",
            TotalAmount = 0 // Will be calculated after adding items
        };

        orders.Add(order);
    }

    context.Orders.AddRange(orders);
    await context.SaveChangesAsync();

    // Create order items
    var orderItems = new List<OrderItem>();
    foreach (var order in orders)
    {
        var numItems = random.Next(1, 4); // 1-3 items per order
        var selectedProducts = products.OrderBy(x => random.Next()).Take(numItems).ToList();

        decimal totalAmount = 0;
        foreach (var product in selectedProducts)
        {
            var quantity = random.Next(1, 4);
            var unitPrice = product.Price * (decimal)(0.9 + random.NextDouble() * 0.2); // ±10% price variation
            
            orderItems.Add(new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = quantity,
                UnitPrice = Math.Round(unitPrice, 2)
            });

            totalAmount += quantity * unitPrice;
        }

        order.TotalAmount = Math.Round(totalAmount, 2);
    }

    context.OrderItems.AddRange(orderItems);
    await context.SaveChangesAsync();
}