using System.Linq.Expressions;

namespace BlazorApp.Shared.Form;

public interface IDynamicFormData
{
    
}

public interface IDynamicFormModel
{
    public List<IDynamicFormFieldModel> Fields { get; set; }
}

public class DynamicFormModel : IDynamicFormModel
{
    public List<IDynamicFormFieldModel> Fields { get; set; }
}

public interface IDynamicFormFieldModel
{
    
    public bool Repeatable { get; set; } 

    public Type? DataType { get; set; }
    
    public IDynamicFormModel? NestedForm { get; set; }
    
    public LambdaExpression Path { get; set; }

    public string Label { get; set; }
}

public class DynamicFormFieldModel: IDynamicFormFieldModel
{
    public bool Repeatable { get; set; }
    
    public Type? DataType { get; set; }
    
    public IDynamicFormModel? NestedForm { get; set; }
    public LambdaExpression Path { get; set; }
    
    public string Label { get; set; }

    public static DynamicFormFieldModel Create<T>(
        Expression<Func<T, object>> path,
        string? label = null
    )
    {
        return new DynamicFormFieldModel()
        {
            Path = path,
            Label = label ?? ""
        };
    }
    
}