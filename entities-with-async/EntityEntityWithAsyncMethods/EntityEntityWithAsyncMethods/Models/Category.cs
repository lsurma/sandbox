using System.ComponentModel.DataAnnotations;

namespace EntityEntityWithAsyncMethods.Models;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    public List<Product> Products { get; set; } = new();
}