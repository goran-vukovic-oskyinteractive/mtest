/*******************************************************************************
          %name: %
       %version: %
 %date_modified: %
    %derived_by: %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BAE.Mercury.Client
{
    public static class ControllerExtensions
    {
        /// <summary>
        /// Converts a rendered view to a raw html string
        /// </summary>
        /// <param name="context">The current controller context</param>
        /// <param name="viewName">The name of the view to render</param>
        /// <param name="model">The model for the view to render</param>
        /// <returns>Raw HTML string</returns>
        public static string RenderViewToString(this ControllerContext context, string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = context.RouteData.GetRequiredString("action");

            ViewDataDictionary viewData = new ViewDataDictionary(model);

            using (StringWriter sw = new StringWriter())
            {
                ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(context, viewName);
                ViewContext viewContext = new ViewContext(context, viewResult.View, viewData, new TempDataDictionary(), sw);
                viewResult.View.Render(viewContext, sw);

                return sw.GetStringBuilder().ToString();
            }
        }

    }
}