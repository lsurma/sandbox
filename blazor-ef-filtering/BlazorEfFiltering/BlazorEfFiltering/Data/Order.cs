using System.ComponentModel.DataAnnotations;

namespace BlazorEfFiltering.Data;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string CustomerEmail { get; set; } = string.Empty;
    
    [Required]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal TotalAmount { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";
    
    [MaxLength(200)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}