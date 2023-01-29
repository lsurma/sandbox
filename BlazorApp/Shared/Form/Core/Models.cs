using System.Linq.Expressions;

namespace BlazorApp.Shared.Form.Core;


public class DynamicFormDefinition
{
    public List<DynamicFormFieldDefinition> Fields { get; set; }
}

public class DynamicFormFieldDefinition
{
    public bool Repeatable { get; set; }
    
    public Type? DataType { get; set; }
    
    public DynamicFormDefinition? NestedForm { get; set; }
    
    public LambdaExpression Path { get; set; }
    
    public string Label { get; set; }

    public static DynamicFormFieldDefinition Create<T>(
        Expression<Func<T, object>> path,
        string? label = null,
        bool? repeatable = false
    )
    {
        return new DynamicFormFieldDefinition()
        {
            Path = path,
            Label = label ?? "",
            Repeatable = repeatable ?? false
        };
    }
    
}