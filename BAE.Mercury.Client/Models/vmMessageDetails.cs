// =================================================
//          %name: vmMessageDetails.cs %
//       %version: 5 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Properties;
using BAE.Mercury.Common.DataTypes;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    /// This class is a viewmodel containing all information required to display a message in the details view.
    /// </summary>
    /// 
    public class vmMessageDetails
    {
        #region Private Member Variables

        private Message Message { get; set; }

        private string _body;

        private string[] _messageTypes = new string[] { "Project", "Drill", "Operation", "Exercise" };
        private string[] _drafters = new string[] { "Jones, Dean", "Healy, Ian", "Botham, Ian", "Ambrose, Curtly" };
        private string[] _releasers = new string[] { "Armstrong, Neil", "Aldrin, Buzz", "Collins, Michael" };
        private TimeSpan _timeToExpire = TimeSpan.MinValue;

        #endregion

        #region Public Properties

        public int MessageID { get; set; }
        public string Subject { get; set; }

        public string Body
        {
            get
            {
                if (string.IsNullOrEmpty(_body))
                {
                    Random randomiser = new Random();
                    int randomChoice = randomiser.Next(0, 3);
                    _body = _messageBodies[randomChoice];
                }
                return _body;
            }
            set { _body = value; }
        }

        public string ClassificationName { get; set; }
        public string ClassificationColour
        {
            get
            {
                return GetClassificationColour(this.ClassificationName);
            }
        }

        public string ActionPrecedence { get; set; }

        public string InfoPrecedence { get; set; }

        public DateTime SentTime { get; set; }
        public DateTime ReceivedTime { get; set; }

        public string Sender { get; set; }
        public string Drafter
        {
            get
            {
                Random randomiser = new Random();
                int randomChoice = randomiser.Next(0, 3);
                return _drafters[randomChoice];
            }
        }
        public string Releaser
        {
            get
            {
                Random randomiser = new Random();
                int randomChoice = randomiser.Next(0, 3);
                return _releasers[randomChoice];
            }
        }

        //public bool Attachment { get; set; } //HasAttachment?

        public bool IsObsolete { get; set; }
        public bool HasRelatedMessages { get; set; }
        public string MessageTypeText { get; set; }
        public string MessageType
        {
            get
            {
                Random randomiser = new Random();
                int randomChoice = randomiser.Next(0, 3);
                return _messageTypes[randomChoice];
            }
        }

        public string MessageInstructions { get; set; }
        public String OriginatorRef { get; set; }
        public DateTime? Expiry { get; set; }
        public DateTime? ReplyBy { get; set; }
        public List<Addressee> ActionAddressees = new List<Addressee>();
        public List<Addressee> InfoAddressees = new List<Addressee>();
        public List<MessageSic> Sics = new List<MessageSic>();

        public string PrivacyMarkings { get; set; }
        public string SecurityCategory { get; set; }

        private string ToDtg(DateTime dt)
        {
            return dt.ToString();
        }
        public string ExpiryDtg
        {
            get
            {
                if (Expiry.HasValue)
                {
                    return ToDtg(Expiry.Value);
                }
                return string.Empty;
            }
        }
        public string ReplyByDtg
        {
            get
            {
                if (ReplyBy.HasValue)
                {
                    return ToDtg(ReplyBy.Value);
                }
                return string.Empty;
            }
        }
        public string SentDtg
        {
            get { return ToDtg(SentTime); }
        }


        public string ExpiredMessage
        {
            get { //return string.Format(Messages.MessageDetailsExpired, ExpiryDtg);
                return null;
            }
        }
        public string ExpiringMessage
        {
            get {
                //return string.Format(Messages.MessageDetailsExpiring, ExpiryDtg);
                return null;
            }
        }
        public string ReplyByDateMessage
        {
            get {
                //return string.Format(Messages.MessageDetailsReplyByDate, ReplyByDtg);
                return null;
            }
        }
        public string ObsoleteMessage
        {
            get {
                //return Messages.MessageDetailsObsolete;
                return null;
            }
        }
        public int TimeToExpireMilliSeconds
        {
            get { return (int)TimeToExpire.TotalMilliseconds; }
        }
        public TimeSpan TimeToExpire
        {
            get
            {
                if (_timeToExpire == TimeSpan.MinValue)
                {
                    _timeToExpire = TimeSpan.Zero;

                    if (Expiry.HasValue)
                    {
                        if (Expiry > DateTime.Now)
                        {
                            _timeToExpire = (Expiry.Value.Subtract(DateTime.Now));
                            if (_timeToExpire.TotalMilliseconds < 0)
                            {
                                // expiry date has passed. We don't need to know by how much.
                                _timeToExpire = TimeSpan.Zero;
                            }
                        }
                    }
                }

                return _timeToExpire;
            }
        }

        public string ErrorMessage { get; set; }

        #endregion
        /// <summary>
        /// ViewModel Constructor. 
        /// </summary>
        /// <param name="message"></param>
        public vmMessageDetails(Message message)
        {

            // NOTE: Fields that are still not available (or just not yet used) from the stub or real message query
            // SentTime
            // ActionPrecedence
            // InfoPrecedence
            // Body (field is available, but data is not).  
            // Message Type

            Message = message;

            ActionPrecedence = message.Precedence.Name;
            InfoPrecedence = message.Precedence.Name;
            Subject = message.Subject;
            Sender = message.OriginatingAddressee.Name;
            ReceivedTime = message.ReceivedTime;
            SentTime = message.ReceivedTime;
            Expiry = message.ExpiryTime;
            ClassificationName = message.ClassificationName;
            //ActionAddressees = message.ActionAddressees.ToList();
            //InfoAddressees = message.InfoAddressees.ToList();
            //Sics = message.Sics.ToList();
        }



        private string GetClassificationColour(string classificationName)
        {
            string colour = "beige";

            if (!string.IsNullOrEmpty(classificationName))
            {
                if (_classificationColours.ContainsKey(classificationName))
                {
                    colour = _classificationColours[classificationName];
                }
            }

            return colour;
        }

        private static string[] _messageBodies = new string[]
                                                {
                                                    "<p> diam ultricies mollis condimentum augue libero, eu tempus porta pellentesque facilisis, cursus senectus vitae elementum. dictumst convallis nam massa egestas integer ultricies maecenas accumsan ante class duis, laoreet posuere arcu metus quisque class purus ac aliquet massa, hac laoreet quis arcu leo arcu porta ipsum per arcu. sodales lacinia egestas in egestas sociosqu inceptos curae aenean et, turpis aenean lorem suscipit sollicitudin quisque rutrum id, ligula primis hac orci inceptos rutrum volutpat pulvinar. turpis imperdiet leo egestas fames dapibus elit sem accumsan, cursus luctus porttitor neque vitae gravida imperdiet curae accumsan, cubilia feugiat ut aptent ullamcorper mollis neque. </p><p> justo sollicitudin volutpat ullamcorper egestas consequat eu volutpat quisque aliquam quis, litora iaculis conubia mi litora aenean condimentum conubia ut et, sed integer id inceptos libero ligula suscipit vulputate porta. senectus cubilia proin aptent ultrices adipiscing nostra conubia, aenean dui posuere rhoncus ut enim, dolor libero lectus eget sapien ultricies. fames rhoncus potenti aenean sociosqu tortor lectus lacus diam nisl suspendisse, nulla purus adipiscing integer ut eu amet faucibus et, torquent senectus pulvinar semper bibendum hendrerit dolor justo lorem. porttitor suspendisse massa maecenas ut bibendum tristique, fames nulla nec vehicula quisque porta fringilla, fermentum nostra rhoncus per justo. </p><p> porta est ut dapibus tincidunt curabitur nisl aptent aliquam convallis sollicitudin, fusce pulvinar fusce inceptos curabitur vulputate congue quisque iaculis pulvinar neque, platea ullamcorper posuere etiam litora praesent massa id fringilla. donec orci donec ac quisque sodales hendrerit odio libero, netus cursus scelerisque praesent ad dictumst per. vestibulum velit quisque nam habitant etiam consequat hac tempus urna morbi sodales, aptent pulvinar erat tristique et aliquam viverra elementum curae. aliquam commodo aptent primis sociosqu urna interdum suspendisse, habitasse etiam at maecenas tortor elit, auctor sagittis libero imperdiet erat integer. </p><p> suspendisse morbi dictumst aliquet quis sem nulla curae, fermentum pharetra platea maecenas inceptos iaculis morbi, eu aenean lacinia dictum mollis curabitur. euismod nam tristique ac curabitur duis, nullam class morbi ut blandit commodo, posuere consequat ac molestie. nibh senectus vitae laoreet habitasse tristique sem, pharetra sagittis eleifend potenti aenean eu, tempus metus condimentum primis imperdiet. volutpat imperdiet nibh malesuada nulla eget nullam cubilia habitant, neque posuere vel fermentum interdum aptent euismod, enim etiam in inceptos integer magna eros. ornare dictum aliquam morbi id platea orci neque maecenas nulla, aenean ipsum proin felis aenean bibendum fames mattis metus, elit pellentesque dictumst tellus nunc integer vivamus at. </p><p> scelerisque varius diam egestas aenean dapibus nisl porttitor pretium auctor purus, fusce proin lacus tempus in dictumst inceptos per fermentum, ante taciti id eget pharetra aliquet leo sed nisi. rhoncus dictumst gravida leo pharetra fames luctus, aptent nulla amet ornare diam suspendisse cubilia, tincidunt aenean viverra et dictumst. eleifend lobortis aenean mi a cursus mollis, senectus velit semper lectus vehicula, nec at curabitur placerat nec. fermentum et vehicula phasellus curabitur interdum eros erat euismod ornare habitant, fermentum interdum sagittis duis dictum pretium conubia et posuere. id nostra dui dolor suspendisse sapien fermentum eros rhoncus, per cubilia vestibulum mattis ante elit suscipit venenatis, scelerisque ac lectus scelerisque varius non leo. </p>", 
                                                    "<p> scelerisque posuere sagittis interdum turpis nibh metus cubilia, lectus commodo neque dictumst turpis curae, aenean nunc quis metus est torquent. nec per tempus et magna nulla erat tempor enim euismod, ipsum lacus urna ultricies elit nostra massa nostra sagittis, porta tristique pretium nostra in nisl sociosqu volutpat. egestas quis quam semper euismod luctus aenean lacus consequat suscipit erat, proin curabitur porta conubia condimentum rhoncus sapien amet nulla, mauris primis semper suscipit nisi sapien sociosqu integer donec. curabitur ultricies primis auctor class feugiat consequat id tincidunt, potenti cursus feugiat curabitur facilisis gravida eros faucibus id, aptent quisque sed aenean velit quis fames. </p><p> suscipit viverra curabitur etiam hendrerit turpis vitae, facilisis purus ut etiam dui cursus, diam eros lacinia cursus faucibus. elementum sit odio consequat vestibulum ante maecenas justo, dolor maecenas aenean arcu ad aenean aptent maecenas, rutrum scelerisque suscipit habitant ac etiam. congue litora cubilia netus gravida nibh placerat curabitur potenti in, aliquam rhoncus metus posuere eget nulla tristique libero, taciti massa rhoncus mollis auctor mattis viverra aliquet. hendrerit magna feugiat ornare sapien per arcu, malesuada integer suscipit a lorem risus rutrum, magna habitasse ultricies praesent eu. elit sodales ante tristique et mi consequat condimentum hac, sociosqu velit ornare congue dolor justo conubia consequat, mi sodales donec elementum mauris lacinia rutrum. </p>", 
                                                    "<p> viverra ipsum ultricies ad proin gravida laoreet, sodales posuere nunc ultricies fringilla iaculis, duis sollicitudin nullam ultricies bibendum. malesuada vestibulum phasellus quisque suscipit est mollis vehicula inceptos nullam sollicitudin, tellus tincidunt consequat risus donec venenatis magna cursus habitant, ante nam scelerisque nunc neque etiam nisl dapibus sed. posuere mollis volutpat luctus elit et habitant leo, senectus aliquam vehicula feugiat adipiscing quis cubilia, quis ornare primis adipiscing blandit ante. dictumst diam est volutpat justo placerat odio pellentesque molestie rhoncus consectetur, etiam quisque habitasse dapibus eu consectetur malesuada vestibulum dictumst. </p>", 
                                                    "<p> lectus phasellus aliquam in vitae faucibus curabitur consectetur conubia ut fusce curabitur hac diam facilisis dictum, proin sed rutrum leo ante turpis faucibus metus congue tempor cubilia aenean ullamcorper curae, dictum ut enim taciti eget ornare cubilia nulla vulputate nullam diam himenaeos tristique class. enim consequat malesuada aenean fusce varius curabitur fermentum vestibulum eros, semper ac facilisis accumsan eros praesent felis. fusce sit blandit tincidunt donec augue malesuada porttitor lorem posuere, dictum consequat a etiam arcu sapien cubilia metus eget ultricies, molestie aptent blandit congue dolor potenti suscipit quisque. </p>"
                                                };

        private static Dictionary<string, string> _classificationColours = new Dictionary<string, string>()
                                                                       {
                                                                           {"UNCLASSIFIED", "beige"},
                                                                           {"RESTRICTED", "beige"},
                                                                           {"PROTECTED", "#ffd800"},
                                                                           {"CONFIDENTIAL", "#87e65d"},
                                                                           {"SECRET", "#f05f5f"},
                                                                           {"TOP SECRET", "#f05f5f"}
                                                                       };

    }
}