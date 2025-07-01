using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using RenderMode=Microsoft.AspNetCore.Mvc.Rendering.RenderMode;

namespace PageBuilder.DynamicPages;

public class ComponentDescriptor
{
    [JsonPropertyName("componentType")]
    public string ComponentType { get; set; } = string.Empty;

    [JsonPropertyName("parameters")]
    public Dictionary<string, object?> Parameters { get; set; } = new();

    [JsonPropertyName("renderMode")]
    public string RenderMode { get; set; } = "Static";

    [JsonPropertyName("children")]
    public List<ComponentDescriptor> Children { get; set; } = new();

    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public RenderMode GetRenderMode()
    {
        return RenderMode.ToLowerInvariant() switch
        {
            "static" => Microsoft.AspNetCore.Mvc.Rendering.RenderMode.Static,
            "server" => Microsoft.AspNetCore.Mvc.Rendering.RenderMode.Server,
            "serverprerendered" => Microsoft.AspNetCore.Mvc.Rendering.RenderMode.ServerPrerendered,
            "webassembly" => Microsoft.AspNetCore.Mvc.Rendering.RenderMode.WebAssembly,
            "webassemblyprerendered" => Microsoft.AspNetCore.Mvc.Rendering.RenderMode.WebAssemblyPrerendered,
            _ => throw new ArgumentException($"Unknown render mode: {RenderMode}", nameof(RenderMode))
        };
    }

    public Type? ResolveComponentType()
    {
        var assembly = System.Reflection.Assembly.GetExecutingAssembly();
        
        var possibleTypes = new[]
        {
            $"PageBuilder.Pages.Shared.{ComponentType}",
            $"PageBuilder.Components.{ComponentType}",
            $"PageBuilder.{ComponentType}",
            ComponentType
        };

        foreach (var typeName in possibleTypes)
        {
            var type = assembly.GetType(typeName);
            if (type != null && typeof(ComponentBase).IsAssignableFrom(type))
            {
                return type;
            }
        }

        return null;
    }
    
    public Dictionary<string, object?> GetParameters()
    {
        var parameters = Parameters;
        
        foreach (var key in Parameters.Keys.ToList())
        {
            if (Parameters[key] is JsonElement jsonElement)
            {
                if (jsonElement.ValueKind == JsonValueKind.String)
                {
                    parameters[key] = jsonElement.GetString();
                }
                else if (jsonElement.ValueKind == JsonValueKind.Number)
                {
                    parameters[key] = jsonElement.GetDouble();
                }
                else if (jsonElement.ValueKind == JsonValueKind.True || jsonElement.ValueKind == JsonValueKind.False)
                {
                    parameters[key] = jsonElement.GetBoolean();
                }
                else if (jsonElement.ValueKind == JsonValueKind.Array)
                {
                    var array = new List<string?>();
                    foreach (var item in jsonElement.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.String)
                        {
                            array.Add(item.GetString());
                        }
                        else if (item.ValueKind == JsonValueKind.Number)
                        {
                            array.Add(item.GetDouble().ToString());
                        }
                        else if (item.ValueKind == JsonValueKind.True || item.ValueKind == JsonValueKind.False)
                        {
                            array.Add(item.GetBoolean().ToString());
                        }
                        else
                        {
                            array.Add(item.ToString());
                        }
                    }
                    parameters[key] = array;
                }
                else if (jsonElement.ValueKind == JsonValueKind.Object)
                {
                    var dict = new Dictionary<string, object?>();
                    foreach (var property in jsonElement.EnumerateObject())
                    {
                        if (property.Value.ValueKind == JsonValueKind.String)
                        {
                            dict[property.Name] = property.Value.GetString();
                        }
                        else if (property.Value.ValueKind == JsonValueKind.Number)
                        {
                            dict[property.Name] = property.Value.GetDouble();
                        }
                        else if (property.Value.ValueKind == JsonValueKind.True || property.Value.ValueKind == JsonValueKind.False)
                        {
                            dict[property.Name] = property.Value.GetBoolean();
                        }
                        else
                        {
                            dict[property.Name] = property.Value.ToString();
                        }
                    }
                    parameters[key] = dict;
                }
                else
                {
                    parameters[key] = jsonElement.ToString();
                }
            }
        }

        if (Children.Any())
        {
            parameters["ChildComponents"] = Children;
        }
        
        return parameters;
    }
}