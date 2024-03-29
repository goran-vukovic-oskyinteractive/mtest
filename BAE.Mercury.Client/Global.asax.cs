﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using BAE.Mercury.Client.Models;
using System.Data.Entity;
//using BAE.Mercury.Client.Classes;


namespace BAE.Mercury.Client
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //Database.SetInitializer<MessageContext>(new DropCreateDatabaseIfModelChanges<MessageContext>());
            //AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();

        }
        //protected void Application_Error(object sender, EventArgs e)
        //{
        //    Exception exception = Server.GetLastError();
        //    Response.Clear();
        //    string file = Server.MapPath("/log/log.txt");
        //    //Do your logging here.
        //    new Log().WriteErrorMessage(file, "Global error has occurred.", Request.Url.ToString(), exception);
        //    //Redirect to an appropriate error page.
        //}
    }
}