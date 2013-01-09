/*******************************************************************************
          %name: vmAlert.cs %
       %version: 1.1.1 %
 %date_modified: %
    %derived_by: LLawley %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using BAE.Mercury.Core.DataTypes;
using BAE.Mercury.Core.Logging;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    /// View Model for user alerts
    /// </summary>
    public class vmAlert
    {
        /// <summary>
        /// The Id of the alert
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// The alert message
        /// </summary>
        public string Message { get; set; }


        #region View/Domain Model Conversion

        /// <summary>
        /// Domain to View Model conversion factory
        /// </summary>
        /// <param name="alertList"></param>
        public static IEnumerable<vmAlert> Alerts(IEnumerable<Alert> alertList)
        {
            return alertList.Select(alert => new vmAlert()
                                                 {
                                                     Id = alert.Id,
                                                     Message = alert.Message
                                                 });
        }


        #endregion

    }

}