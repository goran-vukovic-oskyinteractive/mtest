/*******************************************************************************
          %name: vmAuditMessage.cs %
       %version: 5 %
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
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    /// Holds all information related to a System Audit Entry, suitable for display.
    /// </summary>
    public class vmSystemAuditEntry
    {
        [Key]
        [Display(Name = "Event ID")]
        public int EventId { get; set; }

        [Required]
        [Display(Name = "Time")]
        public string Time { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Station")]
        public string Station { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "User")]
        public string User { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Process Name")]
        public string ProcessName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Severity")]
        public string Severity { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        [Display(Name = "Message")]
        public string Message { get; set; }

        /// <summary>
        /// Initialises a new instance of the vmSystemAuditEntry class.
        /// </summary>
        /// <param name="id">The ID of the message.</param>
        /// <param name="logTime">The time of the message.</param>
        /// <param name="station">The station the message was created at.</param>
        /// <param name="user">The user (use an empty string if not applicable).</param>
        /// <param name="processName">The process that generated the message.</param>
        /// <param name="severity">The severity of the audit (TBD).</param>
        /// <param name="message">The audit message text.</param>
        public vmSystemAuditEntry(int id, DateTime logTime, string station, string user, string processName, string severity, string message)
        {
            this.EventId = id;
            this.Time = logTime.ToUniversalTime().ToString("yyyyMMddHHmmss");
            this.Station = station;
            this.User = user;
            this.ProcessName = processName;
            this.Severity = severity;
            this.Message = message;     
        }

        /// <summary>
        /// Initialises a new instance of the vmSystemAuditEntry class, based on a valid SystemAuditEntry.
        /// </summary>
        /// <param name="message">The message to read the data from.</param>
        public vmSystemAuditEntry(SystemAuditEntry message) : this(message.Id, message.Time, message.Station, message.User, message.Process, message.Severity, message.Description)
        {  
        }
    }
}