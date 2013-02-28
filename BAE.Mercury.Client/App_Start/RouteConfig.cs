using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace BAE.Mercury.Client
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                //defaults: new { controller = "Message", action = "Create", id = UrlParameter.Optional }
                //defaults: new { controller = "Folder", action = "Index", id = UrlParameter.Optional }
                //defaults: new { controller = "AddressBook", action = "Index", id = UrlParameter.Optional }
                defaults: new { controller = "DistributionManagement", action = "Index", id = UrlParameter.Optional }

            );
            
        }
    }
}