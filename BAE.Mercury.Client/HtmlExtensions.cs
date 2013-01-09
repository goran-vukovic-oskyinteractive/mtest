/*******************************************************************************
          %name: HtmlExtensions.cs %
       %version: 2 %
  %date_created: Thu Nov 15 16:13:04 2012 %
    %derived_by: chrisn %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Web.Mvc;

namespace BAE.Mercury.Client
{
    public static class HtmlExtensions
    {
        /// <summary>
        /// Generates a better label.
        /// Text based off given labelText, [DisplayName], or property name.
        /// If the field is optional ([Required]), adds an (optional) em tag.
        /// If the field has a description ([Description]), adds a class="note" span tag.
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="html"></param>
        /// <param name="expression"></param>
        /// <returns></returns>
        /// <remarks>
        /// Output markup:
        /// <code><![CDATA[
        /// <label for="input">
        /// [Label text]
        /// <em class="optional">(optional)</em>
        /// <span class="note">A description</span>
        /// </label>
        /// ]]>
        /// </code>
        /// Inspired by: http://stackoverflow.com/questions/3149385/can-i-change-the-way-labelfor-render-in-mvc/3153654#3153654
        /// </remarks>
        public static MvcHtmlString FieldLabelFor<TModel, TResult>(this HtmlHelper<TModel> html, Expression<Func<TModel, TResult>> expression, string labelText = null)
        {
            string propName = ExpressionHelper.GetExpressionText(expression);
            string unqualifiedPropName = propName.Split('.').Last(); // if there is a . in the name, take the rightmost part.
            ModelMetadata metadata = html.ViewData.ModelMetadata.Properties.First(p => p.PropertyName == propName);

            string finallabelText = labelText ?? metadata.DisplayName ?? metadata.PropertyName ?? unqualifiedPropName;
            if (String.IsNullOrEmpty(finallabelText))
            {
                return MvcHtmlString.Empty;
            }

            StringBuilder htmlBuilder = new StringBuilder();
            TagBuilder tag = new TagBuilder("label");
            tag.Attributes.Add("for", html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldId(propName));
            htmlBuilder.Append(finallabelText);

            if (!metadata.IsRequired)
            {
                htmlBuilder.Append(" <em class='optional'>(optional)</em>");
            }

            // Check description in metadatatype too
            var metaDataType = metadata.ContainerType.GetCustomAttributes(typeof(MetadataTypeAttribute), true).FirstOrDefault();
            var description = metadata.ContainerType.GetProperty(unqualifiedPropName).GetCustomAttributes(typeof(DisplayAttribute), true).FirstOrDefault();

            // No description attr on model prop, check metadatatype
            if (description == null && metaDataType != null)
            {
                var metaProp = ((MetadataTypeAttribute)metaDataType)
                .MetadataClassType.GetProperty(unqualifiedPropName);

                if (metaProp != null)
                    description = metaProp.GetCustomAttributes(typeof(DisplayAttribute), true).FirstOrDefault();
            }

            if (description != null)
            {
                htmlBuilder.Append(String.Format("<span class=\"note\">{0}</span>", (description as DisplayAttribute).Description));
            }

            tag.InnerHtml = htmlBuilder.ToString();

            return MvcHtmlString.Create(tag.ToString(TagRenderMode.Normal));
        }
    }
}
