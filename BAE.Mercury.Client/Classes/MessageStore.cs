using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.MmhsModel;
using System.Diagnostics;
using System.Configuration;
using BAE.Mercury.Core.DataTypes;
using System.Data.SqlClient;
using System.Text;

namespace BAE.Mercury.Client
{
    public class MessageStore
    {
        public string GetDutyOfficer(int option)
        {
            //this is a totally silly method to simulate the duty officer field from the databse
            if (option == 0)
                return "King Cobra";
            else if (option == 1)
                return "Tasmanian Devil";
            else
                return "Achilles";
        }
        public bool IsSetChanged(int id, long ticks)
        {

            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            int userId = 255;
            DateTime timestamp = new DateTime(ticks);
            SqlCommand com = new SqlCommand(String.Format("isDistributionManagementNodeChanged {0}, '{1}'", id, timestamp.ToString("yyyy-MM-dd HH:mm:ss.fff")));
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader rd = com.ExecuteReader();
                rd.Read();  //only one record
                int changed = (int)rd["changed"];
                return changed != 0;
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
        public DMset.EnLockType LockType(string username, int id)
        {

            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            int userId = 255;
            SqlCommand com = new SqlCommand(String.Format("isDistributionManagementNodeLocked {0}", id));
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                reader.Read();  //only one record
                return LockTypeConvert(username, (int)reader["locked"]);
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


        public void LockSet(string user, int setId, bool locked)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            int userId = 255;
            SqlCommand com = new SqlCommand(String.Format("lockDistributionManagementNode {0}, {1}", setId, (locked) ? userId : 0));
            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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

        }
        private string PackSic(RetSic sic)
        {
            StringBuilder sb = new StringBuilder();
            foreach (RetRule rule in sic.Children)
            {
                if (sb.Length > 0) sb.Append(";");
                sb.Append(String.Format("{0}&{1}&{2}", (int) rule.EnumRuleType, (int) rule.EnumMatchType, rule.Name));
            }
            return sb.ToString();
        }


        public void SetActivate(string user, int nodeId, bool state)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("setDistributionManagementSetSate {0}, {1}", nodeId, state));
            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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
        }
        
        
        public void SetSave(string user, RetChangeList changeList)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            try
            {
                con.Open();
                //check the set locking
                foreach (RetChange change in changeList.Changes)
                {
                    switch (change.ChangeType)
                    {
                        case RetChange.EnType.Add:
                            {
                                RetSic sic = change.Sic;
                                string name = PackSic(sic);
                                if (sic.AppointmentId == 0)
                                    throw new ApplicationException("invalid set id");
                                SqlCommand com = new SqlCommand(String.Format("addDistributionManagementNode {0}, '{1}'", sic.AppointmentId, name));
                                com.Connection = con;
                                com.ExecuteNonQuery();
                            }
                            break;
                        case RetChange.EnType.Edit:
                            {
                                RetSic sic = change.Sic;
                                string name = PackSic(sic);
                                if (sic.SicId == 0)
                                    throw new ApplicationException("cannot change this node");
                                string command = String.Format("editDistributionManagementNode {0}, '{1}'", sic.SicId, name);
                                SqlCommand com = new SqlCommand(command);
                                com.Connection = con;
                                com.ExecuteNonQuery();
                            }
                            break;
                        case RetChange.EnType.Delete:
                            {
                                RetSic sic = change.Sic;
                                string name = PackSic(sic);
                                if (sic.SicId == 0)
                                    throw new ApplicationException("cannot delete this node");
                                SqlCommand com = new SqlCommand(String.Format("delDistributionManagementNode {0}", sic.SicId));
                                com.Connection = con;
                                com.ExecuteNonQuery();
                            }
                            break;
                        default:
                            throw new ApplicationException("invalid change type");
                    }
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
        }
        public void AddSet(string user, string nodeName)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("addDistributionManagementNode {0}, {1}", 0, nodeName));
            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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
        }

        public void DeleteSet(string user, int nodeId)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand("delDistributionManagementNode");
            com.Parameters.Add(new SqlParameter("@nodeId", nodeId));
            com.CommandType = System.Data.CommandType.StoredProcedure;
            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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
        }

        public void UpdateSet(string user, int nodeId, string nodeName)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand("editDistributionManagementNode");
            com.Parameters.Add(new SqlParameter("@nodeId", nodeId));
            com.Parameters.Add(new SqlParameter("@nodeName", nodeName));
            com.CommandType = System.Data.CommandType.StoredProcedure;

            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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
        }

        public void SetTimestamp(string user, int setId)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("setDistributionManagementSetTimeStamp {0}", setId));

            com.Connection = con;
            try
            {
                con.Open();
                com.ExecuteNonQuery();
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
        }


        private DMsic.SicType GetSicType(bool type)
        {
            return type ? DMsic.SicType.Action : DMsic.SicType.Info;
        }
        private bool SetSicBool(DMsic.SicType type)
        {
            return (type == DMsic.SicType.Action) ? true : false;
        }

        public void CloneSet(string username, int setId)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("getDistributionManagementSet {0}, {1}", setId, -1));
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
                    DMset.EnLockType lockType = LockTypeConvert(username, (int)reader["locked"]);
                    bool active = (bool)reader["active"];
                    DateTime timestamp = (DateTime)reader["tstamp"];
                    set = new DMset(null, id, name, lockType, active, timestamp); //set name not a requirement here

                }
                reader.NextResult();

                //the units
                List<DMnodeWrap> unitWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    //DMset.EnLockType lockType = LockTypeConvert(username, (int)reader["locked"]);
                    string dutyOfficer = GetDutyOfficer((int)reader["locked"]);
                    DMunit unit = new DMunit(null, id, name, dutyOfficer);
                    DMnodeWrap unitWrap = new DMnodeWrap(unit, parentId);
                    unitWraps.Add(unitWrap);
                }
                //the appoinments
                reader.NextResult();
                List<DMnodeWrap> appointmentWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    DMappointment appointment = new DMappointment(null, id, name);
                    DMnodeWrap appointmentWrap = new DMnodeWrap(appointment, parentId);
                    appointmentWraps.Add(appointmentWrap);
                }
                //the sics
                reader.NextResult();
                List<DMnodeWrap> sicWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    bool type = (bool)reader["nodetype"];
                    DMsic sic = new DMsic(null, id, GetSicType(type));
                    //parse the data in the name
                    string[] rules = name.Split(',');
                    //sic.AddRule
                    //sic.Add(sic);
                    DMsicWrap sicWrap = new DMsicWrap(sic, parentId, name);
                    sicWraps.Add(sicWrap);
                }
                reader.Close();
                int setNo = InsertNode(com, 0, "COPY OF " + set.Name, false, 0);
                //SELECT IDENT_CURRENT('dbo.DMNode')
                foreach (DMnodeWrap unitWrap in unitWraps)
                {
                    if (unitWrap.ParentId == set.Id)
                    {
                        DMunit unit = new DMunit(set, unitWrap.Node.Id, unitWrap.Node.Name, ((DMunit) unitWrap.Node).DutyOfficer);
                        int unitNo = InsertNode(com, setNo, unit.Name, false, 0);
                        //now loop through the sics and append to the appoinments
                        foreach (DMnodeWrap appointmentWrap in appointmentWraps)
                        {
                            if (appointmentWrap.ParentId == unitWrap.Node.Id)
                            {
                                DMappointment appointment = new DMappointment(unit, appointmentWrap.Node.Id, appointmentWrap.Node.Name);
                                int appointmentNo = InsertNode(com, unitNo, appointment.Name, false, 0);
                                foreach (DMsicWrap sicWrap in sicWraps)
                                {
                                    if (sicWrap.ParentId == appointmentWrap.Node.Id)
                                    {
                                        DMsic sic = new DMsic(appointmentWrap.Node, sicWrap.Node.Id, ((DMsic) sicWrap.Node).Type);

                                        InsertNode(com, appointmentNo, sicWrap.Name, SetSicBool(sic.Type), 0);
                                    }
                                }
                            }

                        }
                    }
                }
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

        private int InsertNode(SqlCommand com, int parent, string name, bool type, int locked)
        {
            if (name.Trim().Length <= 0)
                throw new ApplicationException("invalid node name");
            if (parent < 0)
                throw new ApplicationException("invalid node id");
            com.CommandText = String.Format("addDistributionManagementNode {0}, '{1}', {2}, {3}", parent, name, type, locked);
            com.ExecuteNonQuery();
            com.CommandText = "SELECT IDENT_CURRENT('dbo.DMNode')";
            SqlDataReader rd = com.ExecuteReader();
            rd.Read();
            //Type type = aaa.GetType();
            decimal dec = (decimal) rd[0];
            rd.Close();
            int lastRowNo = Convert.ToInt32(dec); // (int)com.ExecuteScalar();
            return lastRowNo;

        }
        private class DMnodeWrap
        {
            private int parentId;
            private DMnode node;
            public DMnodeWrap(DMnode node, int parentId)
            {
                this.node = node;
                this.parentId = parentId;
            }
            public DMnode Node
            {
                get
                {
                    return node;
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

        private class DMsicWrap : DMnodeWrap
        {
            private string name;
            public DMsicWrap(DMnode node, int parentId, string name)
                : base(node, parentId)
            {
                this.name = name;
            }
            public string Name
            {
                get
                {
                    return name;
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
                    DMset.EnLockType lockType = LockTypeConvert(username, (int)reader["locked"]);
                    bool active = (bool)reader["active"];
                    DateTime timestamp = (DateTime)reader["tstamp"];
                    set = new DMset(null, id, name, lockType, active, timestamp); //set name not a requirement here

                }
                reader.NextResult();

                //the units
                List<DMnodeWrap> unitWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];

                    //DMset.LockType locked = LockType(username, (int)reader["locked"]);
                    string dutyOfficer = GetDutyOfficer((int)reader["locked"]);
                    DMunit unit = new DMunit(null, id, name, dutyOfficer);
                    DMnodeWrap unitWrap = new DMnodeWrap(unit, parentId);
                    unitWraps.Add(unitWrap);
                }
                //the appoinments
                reader.NextResult();
                List<DMnodeWrap> appointmentWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    DMappointment appointment = new DMappointment(null, id, name);
                    DMnodeWrap appointmentWrap = new DMnodeWrap(appointment, parentId);
                    appointmentWraps.Add(appointmentWrap);
                    Debug.WriteLine(id, name);
                }
                //the sics
                reader.NextResult();
                List<DMnodeWrap> sicWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    bool type = (bool)reader["nodetype"];
                    DMsic sic = new DMsic(null, id, GetSicType(type));
                    //parse the data in the name
                    DMsicWrap sicWrap = new DMsicWrap(sic, parentId, name);
                    sicWraps.Add(sicWrap);
                    Debug.WriteLine(id, name);
                }
                reader.Close();

                foreach (DMnodeWrap unitWrap in unitWraps)
                {
                    if (unitWrap.ParentId == set.Id)
                    {
                        DMunit unit = new DMunit(set, unitWrap.Node.Id, unitWrap.Node.Name, ((DMunit)unitWrap.Node).DutyOfficer);
                        //now loop through the sics and append to the appoinments
                        foreach (DMnodeWrap appointmentWrap in appointmentWraps)
                        {
                            if (appointmentWrap.ParentId == unitWrap.Node.Id)
                            {
                                DMappointment appointment = new DMappointment(unit, appointmentWrap.Node.Id, appointmentWrap.Node.Name);
                                foreach (DMsicWrap sicWrap in sicWraps)
                                {
                                    if (sicWrap.ParentId == appointmentWrap.Node.Id)
                                    {
                                        DMsic sic = new DMsic(appointmentWrap.Node, sicWrap.Node.Id, ((DMsic)sicWrap.Node).Type);
                                        //we also need to parse the sic data
                                        string[] rules = sicWrap.Name.Split(';');
                                        foreach (string rule in rules)
                                        {
                                                string[] ruleData = rule.Split('&');
                                                Debug.WriteLine(rule);
                                                DMrule.EnRuleType type = (DMrule.EnRuleType)Int32.Parse(ruleData[0]);
                                                DMrule.EnMatchType match = (DMrule.EnMatchType)Int32.Parse(ruleData[1]);
                                                string name = (ruleData.Length >= 3) ? ruleData[2] : String.Empty; //there can be "is anything" rule with 0 characters
                                                DMrule ruleInstance = new DMrule(sic, name, type, match);
                                                sic.AddChild(ruleInstance);
                                        }
                                        //if (sic.Type == DMSic.SicType.Action)
                                        //    appointment.AddAction(sic);
                                        //else
                                        //    appointment.AddInfo(sic);
                                        appointment.AddChild(sic);
                                        sic.DataFinalize();
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
                /*
            catch (SqlException sqlEx)
            {
                Debug.WriteLine(sqlEx.Message);
                throw new ApplicationException(sqlEx.Message);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                throw new ApplicationException(ex.Message);
            }
                 * */
            finally
            {
                if (con != null)
                    con.Close();
            }


        }
        private DMset.EnLockType LockTypeConvert(string username, int locked)
        {
            int userId = 255;
            if (locked == 0)
                return DMset.EnLockType.Unlocked;
            else if (locked == userId)
                return DMset.EnLockType.LockedByCurrent;
            else
                return DMset.EnLockType.LockedByOthers;
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
                List<DMnodeWrap> setWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    string name = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    DMset.EnLockType lockType = LockTypeConvert(username, (int)reader["locked"]);
                    bool action = (bool)reader["active"];
                    DateTime timestamp = (DateTime)reader["tstamp"];
                    //if (username == "ken.ong")
                    //    locked = false;

                    DMset set = new DMset(null, id, name, lockType, action, timestamp);
                    DMnodeWrap setWrap = new DMnodeWrap(set, parentId);
                    setWraps.Add(setWrap);
                }
                reader.NextResult();
                List<DMnodeWrap> unitWraps = new List<DMnodeWrap>();
                while (reader.Read())
                {
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    string name = (string)reader["nodename"];
                    //bool locked = ((int)reader["locked"]) != 0;
                    string dutyOfficer = GetDutyOfficer((int)reader["locked"]);
                    DMunit unit = new DMunit(null, id, name, dutyOfficer);
                    DMnodeWrap unitWrap = new DMnodeWrap(unit, parentId);
                    unitWraps.Add(unitWrap);
                }

                //now loop through the node list and append to the sets
                DistributionManagement distributionManagement = new DistributionManagement();
                foreach (DMnodeWrap setWrap in setWraps)
                {
                    //DateTime timestamp = DateTime(((DMset)setWrap.Node).Ticks);
                    DMset set = new DMset(distributionManagement, setWrap.Node.Id, setWrap.Node.Name, ((DMset)setWrap.Node).LockType,
                        ((DMset)setWrap.Node).Active, new DateTime(((DMset)setWrap.Node).Ticks));
                    foreach (DMnodeWrap unitWrap in unitWraps)
                    {
                        if (unitWrap.ParentId == setWrap.Node.Id)
                        {
                            DMunit unit = new DMunit(set, unitWrap.Node.Id, unitWrap.Node.Name, ((DMunit) unitWrap.Node).DutyOfficer);
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