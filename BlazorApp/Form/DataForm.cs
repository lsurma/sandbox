using System.Linq.Expressions;

namespace BlazorApp.Form;

public interface IFormDataModel
{
    
}

public interface IDataForm
{
}

public class DataForm<T> : IDataForm
{
    public T Data { get; set; } = default(T)!;
    
    public List<DataFormField<T>> Fields { get; set; }
}

public class DataFormField<T> 
{
    public Expression<Func<T, object>> Path { get; set; }

    public string Label { get; set; } = "";
}