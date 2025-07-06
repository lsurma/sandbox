using EntityEntityWithAsyncMethods.Data;
using EntityEntityWithAsyncMethods.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

// Add EF Core with In-Memory database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase(databaseName: "EntityExampleDb"));

// Register UserWrapper factory
builder.Services.AddScoped<IUserWrapperFactory, UserWrapperFactory>();

var app = builder.Build();

// Seed the database
await SeedDataAsync(app);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();

static async Task SeedDataAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Ensure database is created
    await context.Database.EnsureCreatedAsync();

    // Check if data already exists
    if (await context.Users.AnyAsync())
        return;

    var random = new Random();
    var categories = new List<EntityEntityWithAsyncMethods.Models.Category>();
    var users = new List<EntityEntityWithAsyncMethods.Models.User>();

    // Create categories
    var categoryNames = new[] { "Electronics", "Books", "Clothing", "Home & Garden", "Sports", "Toys" };
    foreach (var categoryName in categoryNames)
    {
        var category = new EntityEntityWithAsyncMethods.Models.Category
        {
            Name = categoryName,
            Description = $"Description for {categoryName} category",
            CreatedAt = DateTime.Now.AddDays(-random.Next(1, 365))
        };
        categories.Add(category);
    }
    
    await context.Categories.AddRangeAsync(categories);
    await context.SaveChangesAsync();

    // Create users
    var firstNames = new[] { "John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry" };
    var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez" };
    
    for (int i = 0; i < 20; i++)
    {
        var firstName = firstNames[random.Next(firstNames.Length)];
        var lastName = lastNames[random.Next(lastNames.Length)];
        var user = new EntityEntityWithAsyncMethods.Models.User
        {
            Name = $"{firstName} {lastName}",
            Email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@example.com",
            CreatedAt = DateTime.Now.AddDays(-random.Next(1, 365)),
            IsActive = random.Next(0, 10) > 1 // 90% active users
        };
        users.Add(user);
    }
    
    await context.Users.AddRangeAsync(users);
    await context.SaveChangesAsync();

    // Create products
    var productNames = new[] { "Laptop", "Book", "T-Shirt", "Garden Tool", "Basketball", "Toy Car", "Smartphone", "Novel", "Jeans", "Fertilizer" };
    var products = new List<EntityEntityWithAsyncMethods.Models.Product>();
    
    for (int i = 0; i < 50; i++)
    {
        var product = new EntityEntityWithAsyncMethods.Models.Product
        {
            Name = $"{productNames[random.Next(productNames.Length)]} {i + 1}",
            Description = $"This is a high-quality product with excellent features and great value for money.",
            Price = Math.Round((decimal)(random.NextDouble() * 500 + 10), 2),
            Stock = random.Next(0, 100),
            CreatedAt = DateTime.Now.AddDays(-random.Next(1, 180)),
            UserId = users[random.Next(users.Count)].Id,
            CategoryId = categories[random.Next(categories.Count)].Id
        };
        products.Add(product);
    }
    
    await context.Products.AddRangeAsync(products);
    await context.SaveChangesAsync();
}