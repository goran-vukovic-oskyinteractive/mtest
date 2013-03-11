using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.MmhsModel;
using System.Diagnostics;
using System.Configuration;
using BAE.Mercury.Core.DataTypes;
using System.Data.SqlClient;


namespace BAE.Mercury.Client
{
    public class MessageStore
    {

        private class DMNodeWrap : DMnode
        {
            private int parentId;
            private DMnode node;
            public DMNodeWrap(int id, int parentId, string name, bool readOnly) : base(null, id, name, readOnly)
            {
                this.parentId = parentId;
            }
            public DMnode Node
            {
                get
                {
                    return this;
                }

            }
            public int ParentId
            {
                get
                {
                    return parentId;
                }
            }

        }
        private class DMNodeWrapSIC : DMNodeWrap
        {
            private DMsic.SicType sicType;
            public DMNodeWrapSIC(int id, int parentId, DMsic.SicType sicType, string name, bool readOnly) : base(id, parentId, name, readOnly)
            {
                this.sicType = sicType;
            }
            public DMsic.SicType Type
            {
                get
                {
                    return sicType;
                }
            }
        }
        public DMset GetDMSet(string username, int setId, int unitId)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("getDistributionManagementSet {0}, {1}", setId, unitId));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                //the set
                DMset set = null;
                reader.Read();
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    bool readOnly = (bool)reader["readOnly"];
                    set = new DMset(null, id, name, readOnly); //set name not a requirement here

                }
                reader.NextResult();

                //the units
                List<DMNodeWrap> unitsWrap = new List<DMNodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMNodeWrap unitWrap = new DMNodeWrap(id, parentId, name, readOnly);
                    unitsWrap.Add(unitWrap);
                }
                //the appoinments
                reader.NextResult();
                List<DMNodeWrap> appointmentsWrap = new List<DMNodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMNodeWrap appointmentWrap = new DMNodeWrap(id, parentId, name, readOnly);
                    appointmentsWrap.Add(appointmentWrap);
                }
                //the sics
                reader.NextResult();
                List<DMNodeWrapSIC> sicsWrap = new List<DMNodeWrapSIC>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parent = (int)reader["nodeparentid"];
                    bool action = (bool)reader["nodetype"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMNodeWrapSIC sicWrap = new DMNodeWrapSIC(id, parent, action ? DMsic.SicType.Action : DMsic.SicType.Info, name, readOnly);
                    //parse the data in the name
                    //string[] rules = name.Split(',');
                    //sic.AddRule
                    //sics.Add(sic);
                    sicsWrap.Add(sicWrap);
                }

                foreach (DMNodeWrap unitWrap in unitsWrap)
                {
                    if (unitWrap.ParentId == set.Id)
                    {
                        DMunit unit = new DMunit(set, unitWrap.Id, unitWrap.Name, (set.ReadOnly) ? true : unitWrap.ReadOnly);
                        //now loop through the sics and append to the appoinments
                        foreach (DMNodeWrap appointmentWrap in appointmentsWrap)
                        {
                            if (appointmentWrap.ParentId == unitWrap.Id)
                            {
                                DMappointment appointment = new DMappointment(unit, appointmentWrap.Id, appointmentWrap.Name, unit.ReadOnly);
                                foreach (DMNodeWrapSIC sicWrap in sicsWrap)
                                {
                                    if (sicWrap.ParentId == appointmentWrap.Id)
                                    {
                                        DMsic sic = new DMsic(appointmentWrap.Node, sicWrap.Id, sicWrap.Type, unit.ReadOnly);
                                        //we also need to parse the sic data
                                        string[] rules = sicWrap.Name.Split(';');
                                        for (int i = 0; i < rules.Length; i++)
                                        {
                                            string ruleInstance = rules[i];
                                            string[] ruleData = rules[i].Split('&');
                                            DMrule.RuleType type = (DMrule.RuleType)Int32.Parse(ruleData[0]);
                                            DMrule.MatchType match = (DMrule.MatchType)Int32.Parse(ruleData[1]);
                                            string name = ruleData[2];
                                            DMrule rule = new DMrule(sic, i, name, false, type, match);
                                            sic.AddChild(rule);
                                        }
                                        //if (sic.Type == DMSic.SicType.Action)
                                        //    appointment.AddAction(sic);
                                        //else
                                        //    appointment.AddInfo(sic);
                                        appointment.AddChild(sic);
                                    }
                                }
                                unit.AddChild(appointment);

                            }

                        }
                        set.AddChild(unit);
                    }
                }
                return set;

            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
                throw new ApplicationException(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }


        }
        public DistributionManagement GetDistributionManagement(string username)
        {

            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand("getDistributionManagementSets");
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                List<DMNodeWrap> setsWrap = new List<DMNodeWrap>();
                while (reader.Read())
                {
                    string setName = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parent = (int)reader["nodeparentid"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMNodeWrap set = new DMNodeWrap(id, parent, setName, readOnly);
                    setsWrap.Add(set);
                }
                reader.NextResult();
                List<DMNodeWrap> unitsWrap = new List<DMNodeWrap>();
                while (reader.Read())
                {
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    string setName = (string)reader["nodename"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMNodeWrap unit = new DMNodeWrap(id, parentId, setName, readOnly);
                    unitsWrap.Add(unit);
                }

                //now loop through the node list and append to the sets
                DistributionManagement distributionManagement = new DistributionManagement();
                foreach (DMNodeWrap setWrap in setsWrap)
                {
                    DMset set = new DMset(distributionManagement, setWrap.Id, setWrap.Name, setWrap.ReadOnly);
                    foreach (DMNodeWrap unitWrap in unitsWrap)
                    {
                        if (unitWrap.ParentId == setWrap.Id)
                        {
                            DMunit unit = new DMunit(set, unitWrap.Id, unitWrap.Name, unitWrap.ReadOnly);
                            set.AddChild(unit);
                        }
                    }
                    distributionManagement.AddChild(set);
                }
                return distributionManagement;
            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
                throw new ApplicationException(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }

        }
        public OskyAddressBooks GetAddressBooks(string userName)
        {
            OskyAddressBooks oskyAddressBooks = new OskyAddressBooks();
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("get_addressBooks '{0}'", userName));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                //inbox
                while (reader.Read())
                {
                    AddressBookSession addressBookSession = new AddressBookSession((int)reader["id"], (int)reader["status"], (string)reader["annotation"], (DateTime)reader["EffectiveDate"], (DateTime)reader["ExpirationDate"]);
                    oskyAddressBooks.addressBookSessions.Add(addressBookSession);
                }
            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
            return oskyAddressBooks;
        }
        public OskyMessageFolders GetMessageFolders(string userName)
        {
            OskyMessageFolders oskyMessageFolders = new OskyMessageFolders();
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("get_mailBoxes '{0}'", userName));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                //inbox
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string)reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.inbox.Add(mailBox);
                }
                reader.NextResult();
                //sent
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string) reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.sent.Add(mailBox);
                }
                reader.NextResult();
                //draft
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string) reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.draft.Add(mailBox);
                }
                reader.NextResult();
                //template
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string)reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.templates.Add(mailBox);
                }
                reader.NextResult();
                //objective
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string)reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.objective.Add(mailBox);
                }
                reader.NextResult();
                //discard
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string)reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.discard.Add(mailBox);
                }
                reader.NextResult();
                //other
                while (reader.Read())
                {
                    MailBox mailBox = new MailBox((int)reader["id"], (string)reader["account"], (string)reader["name"], (int)reader["items"]);
                    oskyMessageFolders.folder.Add(mailBox);
                }
                reader.Close();
            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
            return oskyMessageFolders;
        }
        //public List<MailBox> GetFolders()
        //{
        //    return null;
        //}
        public OskyAddressBookAppointments GetAddressBookAppointments(string user, int sessionId)
        {
            OskyAddressBookAppointments oskyAddressBookAppointments = new OskyAddressBookAppointments();
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("get_appointments '{0}', {1}", user, sessionId));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                while (reader.Read())
                {
                    Appointment appointment = new Appointment((int)reader["Id"], (string)reader["annotation"], (int)reader["branch"], (string)reader["data"]);
                    oskyAddressBookAppointments.appointments.Add(appointment);
                }
                reader.Close();
            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
            return oskyAddressBookAppointments;
        }

        public List<Message> GetMessages(string user, string folders, int lastMessageId, int count, string sort_by_dtg, string sort, string keyword_search)
        {
            List<Message> messages = new List<Message>();
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            bool desc = (sort=="desc");
            SqlCommand com = new SqlCommand(String.Format("get_messages1 '{0}', {1}, {2}, {3}, '{4}', {5}, '{6}'",
                user, folders, lastMessageId, count, sort_by_dtg, desc, keyword_search));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                while (reader.Read())
                {
                    //OriginatingAddresseeClass originatingAddressee = new OriginatingAddresseeClass("@john.smith@bae.com");
                    //originatingAddressee.Name = ; // (string)reader["OriginatingAddressee"];
                    //_ActionAddressees, _Attachments, _ClassificationName, _ExpiryTime, _Id, _OriginatingAddressee, _ReceivedTime, _Precedence, _Subject);
                    Message message = new Message((string)reader["ActionAddressees"], null, (int)reader["Classification"],
                        (string)reader["content"],
                        (DateTime)reader["ExpiryTime"], (int)reader["Id"], 1, (DateTime)reader["ReceivedTime"],
                        (int)reader["Precedence"], (string)reader["Subject"]);
                    messages.Add(message);
                }
                reader.Close();
            }
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
            return messages;
        }
    }
}