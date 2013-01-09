/*******************************************************************************
          %name: vmSiteConfiguration.cs %
       %version: 9 %
  %date_created:  Thu Dec  6 16:21:12 2012 %
    %derived_by: LLawley %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/

using BAE.Mercury.Common.DataTypes;
using BAE.Mercury.Core.MmhsModel;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Web;
using BAE.Mercury.Common.Configuration;
using BAE.Mercury.Core.DataTypes;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    /// This class is a placeholder - eventually there will be an equivalent class in the Core library, once the database is up and running.
    /// </summary>
    public class vmSiteConfiguration
    {
        [Required]
        [Display(Name = "Read Receipts - Incoming", Description = "Allow incoming read receipts")]
        public bool IncomingReadReceipts { get; set; }

        [Required]
        [Display(Name = "Read Receipts - Outgoing", Description = "Allow outgoing read receipts")]
        public bool OutgoingReadReceipts { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Switch Address", Description = "The address of the message switch")]
        public string SwitchAddress { get; set; }

        [Required]
        [Display(Name = "Connection to Objective", Description = "The connection to Objective")]
        public string ArchivingUrl { get; set; }

        [Required]
        [Display(Name = "Objective Username", Description = "The Username to log in to Objective")]
        public string ArchivingUsername { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Objective Password", Description = "The password to log in to Objective")]
        public string ArchivingPassword { get; set; }


        /// <summary>
        /// Initialises a new instance of the vmSiteConfiguration class.
        /// </summary>
        /// <param name="incomingReadReceipts">Whether incoming read receipts are allowed.</param>
        /// <param name="outgoingReadReceipts">Whether outgoing read receipts are allowed.</param>
        /// <param name="switchAddress">The address of the connected switch.</param>
        /// <param name="archivingUrl">The connection to the Objective archiving system.</param>
        /// <param name="archivingUsername">The username to connect with.</param>
        /// <param name="archivingPassword">The password to connect with.</param>
        public vmSiteConfiguration(bool incomingReadReceipts, bool outgoingReadReceipts, string switchAddress, string archivingUrl, string archivingUsername, string archivingPassword)
        {
            this.IncomingReadReceipts = incomingReadReceipts;
            this.OutgoingReadReceipts = outgoingReadReceipts;
            this.SwitchAddress = switchAddress;
            this.ArchivingUrl = archivingUrl;
            this.ArchivingUsername = archivingUsername;
            this.ArchivingPassword = archivingPassword;
        }

        /// <summary>
        /// Copy constructor.
        /// </summary>
        /// <param name="configuration">The object to copy.</param>
        public vmSiteConfiguration(vmSiteConfiguration configuration)
        {
            this.IncomingReadReceipts = configuration.IncomingReadReceipts;
            this.OutgoingReadReceipts = configuration.OutgoingReadReceipts;
            this.SwitchAddress = configuration.SwitchAddress;
            this.ArchivingUrl = configuration.ArchivingUrl;
            this.ArchivingUsername = configuration.ArchivingUsername;
            this.ArchivingPassword = configuration.ArchivingPassword;
        }

        /// <summary>
        /// Default public constructor.  The Ajax post back won't work without this.
        /// </summary>
        public vmSiteConfiguration()
        {
        }

        #region View/Domain Model Conversion

        /// <summary>
        /// Domain to View Model conversion factory
        /// </summary>
        /// <param name="parameters">the full list of configuration parameters to covert to a VM object</param>
        public static vmSiteConfiguration SiteConfiguration(IDictionary<ConfigurationParameterNames, Object> parameters)
        {
            vmSiteConfiguration newSiteConfiguration = new vmSiteConfiguration();
            //g.v. commented out
            //newSiteConfiguration.IncomingReadReceipts = (bool)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.AllowIncomingReadReceipts);
            //newSiteConfiguration.OutgoingReadReceipts = (bool)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.AllowOutgoingReadReceipts);
            //newSiteConfiguration.SwitchAddress = (string)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.SwitchServerAddress);
            //newSiteConfiguration.ArchivingUrl = (string)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.ArchivingUrl);
            //newSiteConfiguration.ArchivingUsername = (string)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.ArchivingUsername);
            //newSiteConfiguration.ArchivingPassword = (string)EnumExtensions.ReadConfigurationParameter(parameters, ConfigurationParameterNames.ArchivingPassword);

            return newSiteConfiguration;
        }

        /// <summary>
        /// This method is used to covert the data returned from the browser to the type
        /// expected by ConfigurationParameters - the class in Common that is used to
        /// update the database.
        /// </summary>
        /// <returns>The of configuration parameters</returns>
        public IDictionary<ConfigurationParameterNames, Object> ConfigurationList()
        {
            IDictionary<ConfigurationParameterNames, Object> configList = new Dictionary<ConfigurationParameterNames, Object>();

            //g.v. commented out
            //configList.Add(ConfigurationParameterNames.AllowIncomingReadReceipts, IncomingReadReceipts);
            //configList.Add(ConfigurationParameterNames.AllowOutgoingReadReceipts, OutgoingReadReceipts);
            //configList.Add(ConfigurationParameterNames.SwitchServerAddress, SwitchAddress);
            //configList.Add(ConfigurationParameterNames.ArchivingUrl, ArchivingUrl);
            //configList.Add(ConfigurationParameterNames.ArchivingUsername, ArchivingUsername);
            //configList.Add(ConfigurationParameterNames.ArchivingPassword, ArchivingPassword);

            return configList;
        }

        #endregion
    }
}