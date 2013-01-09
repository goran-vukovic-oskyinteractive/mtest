// =================================================
//          %name: vmMessage.cs %
//          %version: 31 %
//          %date_created: Thu Dec 13 08:16:40 2012 %
//          %derived_by:DSaustin %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================



using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using BAE.Mercury.Core.MmhsModel;
using BAE.Mercury.Common.DataTypes;
using BAE.Mercury.Core.MmhsModel.Enums;
using System.Web.Mvc;


namespace BAE.Mercury.Client.Models
{
    
    /// <summary>
    /// View model for New Message Creation 
    /// </summary>
    public class vmMessage : IValidatableObject //self validating model
    {
        private String _actionPrecedence = "";
        private String _infoPrecedence = "";

        private String[] _messageTypes = new String[] { "Project", "Drill", "Operation", "Exercise" };
        private String[] _drafters = new String[] { "Jones, Dean", "Healy, Ian", "Botham, Ian", "Ambrose, Curtly" };
        private String[] _releasers = new String[] { "Armstrong, Neil", "Aldrin, Buzz", "Collins, Michael" };
        private DateTime _sent = DateTime.Today;

        [Key]
        public int MessageID { get; set; }

        [StringLength(128,ErrorMessage="Subject can only be 128 characters in length")]
        public String Subject { get; set; }

        private String _body;

        [AllowHtml]
        [Required(ErrorMessage = "Message body is mandatory")]
        public String Body
        {
            get
            {                 
                return _body;
            }
            set { _body = value; }
        }
        private String classificationName = "RESTRICTED";
        private String classificationColour = "beige";
        public String ClassificationName { get { return this.classificationName; } set { this.classificationName = value; } }
        public String ClassificationColour { get { return this.classificationColour; } set { this.classificationColour = value; } }
        public String ActionPrecedence
        {
            get { return _actionPrecedence; }
            set { _actionPrecedence = value; }
        }
        public String InfoPrecedence
        {
            get { return _infoPrecedence; }
            set { _infoPrecedence = value; }
        }
        public String State { get; set; }

        [Required(ErrorMessage = "Message Sender is mandatory")]
        public String Sender { get; set; }
        public String Drafter { get; set; }
        public String Releaser { get; set; }
        public String Group { get; set; }
        public String PrivacyMarkings { get; set; }
        public String SecurityCategory { get; set; }
        public String MessageTypeText { get; set; }
        public String MessageType { get; set; }
        public String MessageInstructions { get; set; }

        [Required(ErrorMessage = "Message Originator Reference is mandatory")]
        [StringLength(61, ErrorMessage = "Originator Reference can only be 61 characters in length")]
        public String OriginatorRef { get; set; }
         
        [DisplayName("Date / Time sent")]
        [DataType(DataType.DateTime)]
        public DateTime Sent
        {
            get { return _sent; }
            set { _sent = value; }
        }
        public DateTime ReceivedTime { get; set; }
        //In military messages and communications (e.g. on maps showing troop movements) the format is DDHHMMZ Mon YY, 
        //so for instance, "271545Z FEB 08" represents 15:45 Zulu time (which is to say UTC) on the 27th of February, 2008.[1]

        private DateTimeOffset _dtg = DateTime.UtcNow;
        [Required(ErrorMessage = "Message DTG is mandatory")]
        public string Dtg
        {
            get { return _dtg.ToString(); }
            set { _dtg = DateTimeOffset.Parse(value); }
        }

        private DateTimeOffset? _expiry;
        public String Expiry  
        {
            get { return _expiry.ToString(); }
            set
            {
                if (value == null)
                {
                    _expiry = null;
                }
                else
                {
                    _expiry = DateTimeOffset.Parse(value);
                }
            }
        }

        private DateTimeOffset? _reply;
        public String ReplyBy  
          {
              get { return _reply.ToString(); }
              set
              {
                  if (value == null)
                  {
                      _reply = null;
                  }
                  else
                  {
                      _reply = DateTimeOffset.Parse(value);
                  }
              }
        }

        private List<String> _actionAddressees = new List<String>();
        public List<String> ActionAddressees 
        { 
            get{ return _actionAddressees; }
            set { _actionAddressees = value; }
        }

        private List<String> _infoAddressees = new List<String>();  
        public List<String> InfoAddressees
        { 
            get{ return _infoAddressees; }
            set { _infoAddressees = value; }
        }

        private List<String> _sics = new List<String>();
        public List<String> Sics
        {
            get { return _sics; }
            set { _sics = value; }
        }

        public int ListID { get; set; }
        public int GroupIndex { get; set; }

        public bool Attachment { get; set; }
        public bool IsObsolete { get; set; }
        public bool HasRelatedMessages { get; set; }

        //blank constructor
        public vmMessage()
        {
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var field = new[] { "Sent" };
            if (Sent > DateTime.Now)
            {
                yield return new ValidationResult("Sent datetime cannot be later than Now", field);
            }
        } 
 
    } 

    public class vmNewMessage : vmMessage {}
}
