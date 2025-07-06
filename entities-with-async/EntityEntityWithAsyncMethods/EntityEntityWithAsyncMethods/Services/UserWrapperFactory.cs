using EntityEntityWithAsyncMethods.Data;
using EntityEntityWithAsyncMethods.Models;
using Microsoft.EntityFrameworkCore;

namespace EntityEntityWithAsyncMethods.Services;

public class UserWrapperFactory : IUserWrapperFactory
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserWrapper> _userWrapperLogger;
    private readonly ILogger<UserWrapperFactory> _logger;

    public UserWrapperFactory(
        ApplicationDbContext context,
        ILogger<UserWrapper> userWrapperLogger,
        ILogger<UserWrapperFactory> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _userWrapperLogger = userWrapperLogger ?? throw new ArgumentNullException(nameof(userWrapperLogger));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public UserWrapper CreateUserWrapper(User user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        _logger.LogDebug("Creating UserWrapper for user {UserId}", user.Id);
        return new UserWrapper(user, _context, _userWrapperLogger);
    }

    public async Task<UserWrapper?> CreateUserWrapperAsync(int userId)
    {
        _logger.LogDebug("Creating UserWrapper for user ID {UserId}", userId);
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found", userId);
            return null;
        }

        return CreateUserWrapper(user);
    }

    public Task<List<UserWrapper>> CreateUserWrappersAsync(IEnumerable<User> users)
    {
        if (users == null)
            throw new ArgumentNullException(nameof(users));

        var userList = users.ToList();
        _logger.LogDebug("Creating {Count} UserWrapper instances", userList.Count);

        var wrappers = new List<UserWrapper>();
        foreach (var user in userList)
        {
            wrappers.Add(CreateUserWrapper(user));
        }

        return Task.FromResult(wrappers);
    }

    public async Task<List<UserWrapper>> CreateActiveUserWrappersAsync()
    {
        _logger.LogDebug("Creating UserWrapper instances for all active users");
        
        var activeUsers = await _context.Users
            .Where(u => u.IsActive)
            .ToListAsync();

        return await CreateUserWrappersAsync(activeUsers);
    }
}