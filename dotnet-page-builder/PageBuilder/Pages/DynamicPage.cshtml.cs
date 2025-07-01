using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PageBuilder.DynamicPages;

namespace PageBuilder.Pages;

public class DynamicPageModel : PageModel
{
    [BindProperty(SupportsGet = true)]
    public string? PageId { get; set; }
    
    public List<ComponentDescriptor> ComponentDescriptors { get; private set; } = new();
    
    public DynamicPageModel()
    {
    }

    public void OnGet()
    {
        LoadPageConfiguration();
    }

    private void LoadPageConfiguration()
    {
        ComponentDescriptors = LoadDefaultConfiguration();
    }

    private List<ComponentDescriptor> LoadDefaultConfiguration()
    {
        return new List<ComponentDescriptor>
        {
            // new ComponentDescriptor
            // {
            //     ComponentType = "TestComponent",
            //     RenderMode = "Static",
            //     Parameters = new Dictionary<string, object?>(),
            // },
            //
            // new ComponentDescriptor()
            // {
            //     ComponentType = "Counter",
            //     RenderMode = "Static",
            //     Parameters = new Dictionary<string, object?>(),
            // },
            //
            // new ComponentDescriptor()
            // {
            //     ComponentType = "Counter",
            //     RenderMode = "ServerPrerendered",
            //     Parameters = new Dictionary<string, object?>(),
            // },
            
            new ComponentDescriptor
            {
                ComponentType = "Row",
                RenderMode = "Server",
                Parameters = new Dictionary<string, object?>(),
                
                Children = new List<ComponentDescriptor>()
                {
                    new ComponentDescriptor()
                    {
                        ComponentType = "Col",
                        RenderMode = "Static",
                        Parameters = new Dictionary<string, object?>(),
                        
                        Children = new List<ComponentDescriptor>()
                        {
                            new ComponentDescriptor()
                            {
                                ComponentType = "ImageGallery",
                                RenderMode = "Static",
                                Parameters = new Dictionary<string, object?>()
                                {
                                    {"ImageUrls", new List<string>()
                                    {
                                        "https://picsum.photos/200/302",
                                        "https://picsum.photos/200/303",
                                        "https://picsum.photos/200/304"
                                    }}
                                }
                            },
                        }
                    },
                }
            },
            
            // new ComponentDescriptor
            // {
            //     ComponentType = "Row",
            //     RenderMode = "Static",
            //     Parameters = new Dictionary<string, object?>(),
            //     
            //     Children = new List<ComponentDescriptor>()
            //     {
            //         new ComponentDescriptor()
            //         {
            //             ComponentType = "Col",
            //             RenderMode = "Static",
            //             Parameters = new Dictionary<string, object?>(),
            //             
            //             Children = new List<ComponentDescriptor>()
            //             {
            //                 new ComponentDescriptor()
            //                 {
            //                     ComponentType = "Counter",
            //                     RenderMode = "Static",
            //                     Parameters = new Dictionary<string, object?>(),
            //                 },
            //             }
            //         },
            //         
            //         new ComponentDescriptor()
            //         {
            //             ComponentType = "Col",
            //             RenderMode = "Static",
            //             Parameters = new Dictionary<string, object?>(),
            //             
            //             Children = new List<ComponentDescriptor>()
            //             {
            //                 new ComponentDescriptor()
            //                 {
            //                     ComponentType = "Counter",
            //                     RenderMode = "Static",
            //                     Parameters = new Dictionary<string, object?>(),
            //                 },
            //             }
            //         },
            //         
            //     }
            // }
        };
    }

}