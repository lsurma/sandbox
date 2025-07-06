using EntityEntityWithAsyncMethods.Models;

namespace EntityEntityWithAsyncMethods.Services;

public interface IUserWrapperFactory
{
    UserWrapper CreateUserWrapper(User user);
    Task<UserWrapper?> CreateUserWrapperAsync(int userId);
    Task<List<UserWrapper>> CreateUserWrappersAsync(IEnumerable<User> users);
    Task<List<UserWrapper>> CreateActiveUserWrappersAsync();
}