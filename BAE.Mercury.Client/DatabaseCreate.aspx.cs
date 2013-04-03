using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Client
{
    public partial class DatabaseCreate : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {}

            /*
            string connectionString = ConfigurationManager.ConnectionStrings["MessageContext"].ToString();
            SqlConnection con = new SqlConnection(connectionString);
            try
            {
                {
                con.Open();
                SqlCommand com = new SqlCommand(String.Format("delDistributionManagementNode {0}", 0)); //delete everything
                com.Connection = con;
                com.ExecuteNonQuery();
                }
                {
                    DistributionManagement dm = new DistributionManagement();
                    for (int s = 0; s < 10; s++)
                    {
                        DMset set = new DMset(dm, 0, "Set " + s.ToString(), false, )
                    }

                }
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

        }
    }
             * /
}
}