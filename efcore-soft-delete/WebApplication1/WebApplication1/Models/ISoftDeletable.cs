namespace WebApplication1.Models;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
}