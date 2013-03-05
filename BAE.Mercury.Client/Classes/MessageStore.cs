﻿using System;
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

        public DMSet GetDMSet(string username, int nodeId, int unitId)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            SqlCommand com = new SqlCommand(String.Format("getDistributionManagementSet {0}, {1}", nodeId, unitId));
            com.CommandType = System.Data.CommandType.Text;
            com.Connection = con;
            try
            {
                con.Open();
                SqlDataReader reader = com.ExecuteReader();
                DMSet set = new DMSet(nodeId, 0, String.Empty, false); //set name not a requirement here
                //the units
                List<DMUnit> units = new List<DMUnit>();
                while (reader.Read())
                {
                        string setName = (string)reader["nodename"];
                        int id = (int)reader["nodeid"];
                        int parent = (int)reader["nodeparentid"];
                        bool readOnly = (bool)reader["readOnly"];
                        DMUnit unit = new DMUnit(id, parent, setName, readOnly);
                        units.Add(unit);
                }
                //the appoinments
                reader.NextResult();
                List<DMAppointment> appointments = new List<DMAppointment>();
                while (reader.Read())
                {
                    string setName = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parent = (int)reader["nodeparentid"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMAppointment appointment = new DMAppointment(id, parent, setName, readOnly);
                    appointments.Add(appointment);
                }
                //the sics
                reader.NextResult();
                List<DMSic> sics = new List<DMSic>();
                while (reader.Read())
                {
                    string setName = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parent = (int)reader["nodeparentid"];
                    bool action = (bool)reader["nodetype"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMSic sic = new DMSic(id, parent, setName, action ? DMSic.SicType.Action : DMSic.SicType.Info, readOnly);
                    sics.Add(sic);
                }

                //now loop through the sics and append to the appoinments
                    foreach (DMAppointment appointment in appointments)
                    {
                        foreach (DMSic sic in sics)
                        {
                            if (sic.ParentId == appointment.Id)
                            {
                                if (sic.Type == DMSic.SicType.Action)
                                    appointment.AddAction(sic);
                                else
                                    appointment.AddInfo(sic);
                            }
                        }

                    }
                foreach (DMUnit unit in units)
                {
                    foreach (DMAppointment appointment in appointments)
                    {
                        if (appointment.ParentId == unit.Id)
                        {
                            unit.AddNode(appointment);
                        }
                    }
                    set.AddNode(unit);
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
                DistributionManagement distributionManagement = new DistributionManagement();
                while (reader.Read())
                {
                    string setName = (string)reader["nodename"];
                    int id = (int)reader["nodeid"];
                    int parent = (int)reader["nodeparentid"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMSet set = new DMSet(id, parent, setName, readOnly);
                    distributionManagement.AddNode(set);
                }
                reader.NextResult();
                List<DMUnit> units = new List<DMUnit>();
                while (reader.Read())
                {
                    int id = (int)reader["nodeid"];
                    int parentId = (int)reader["nodeparentid"];
                    string setName = (string)reader["nodename"];
                    bool readOnly = (bool)reader["readOnly"];
                    DMUnit unit = new DMUnit(id, parentId, setName, readOnly);
                    units.Add(unit);
                }
                //now loop through the node list and append to the sets
                foreach (DMSet set in distributionManagement.Nodes)
                {
                    foreach (DMUnit unit in units)
                    {
                        if (unit.ParentId == set.Id)
                        {
                            set.AddNode(unit);
                        }
                    }
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