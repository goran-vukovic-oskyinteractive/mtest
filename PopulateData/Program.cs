using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.SqlClient;

namespace PopulateData
{
    class Program
    {
        Random random = new Random();
        const string LoremIpsum = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." + "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." + "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        static void Main(string[] args)
        {
            Program pr = new Program();
            pr.Run();
        }
        private string Content()
        {
            int indexStart = random.Next(0, 200);
            //now find space
            int sentenceStart = LoremIpsum.IndexOf(". ", indexStart) + 2;
            int length = random.Next(20, 200);
            int sentenceEnd = LoremIpsum.IndexOf(". ", sentenceStart + length);
            return LoremIpsum.Substring(sentenceStart, sentenceEnd - sentenceStart).Trim();
        }
        private string Subject()
        {
            int indexStart = random.Next(0, 200);
            //now find space
            int sentenceStart = LoremIpsum.IndexOf(". ", indexStart) + 2;
            int length = random.Next(20, 50);
            int sentenceEnd = LoremIpsum.IndexOf(" ", sentenceStart + length);
            string result = LoremIpsum.Substring(sentenceStart, sentenceEnd - sentenceStart).Trim();
            return result;
        }
        private void Run()
        {
            SqlConnection con = new SqlConnection("Data Source=VTSQL2008DEV;Initial Catalog=DB_52806_mercury;Integrated Security=True;");


            SqlCommand com = new SqlCommand();
            com.Connection = con;
            com.CommandType = System.Data.CommandType.Text;
            //firstly clear the table
            try
            {
                con.Open();
                com.CommandText = "truncate table message";
                com.ExecuteNonQuery();
                DateTime received = DateTime.Now - new TimeSpan(5, 0, 0, 0);
                for (int i = 0; i < 1000 ; i++)
                {                    
                    TimeSpan ts = new TimeSpan(0, random.Next(2, 120), 0);
                    received +=  ts;
                    if (received >= DateTime.Now)
                        break;
                    DateTime expires = received + new TimeSpan(random.Next(3, 7), 0, 0, 0);
                    string rec = received.ToString("dd-MMM-yyyy hh:mm:sss");
                    string content = Content();
                    string subject = "Message " + i + " " + Subject();
                    com.CommandText = String.Format(
                        "insert into message (AccountId, FolderId, ActionAddressees, ClassificationName, content, ExpiryTime, OriginatingAddressee, ReceivedTime,  Subject, Precedence)"
                        +       "values(      '{0}',     '{1}',    '{2}',              '{3}',          '{4}',     '{5}',      '{6}',              '{7}',          '{8}',     '{9}')", 
                        random.Next(1,3),
                        random.Next(1,4),
                        "1,2",
                        random.Next(1, 4),
                        content,
                        expires.ToString("yyyy-MMM-dd hh:mm:sss tt"),
                        random.Next(1, 3),
                        received.ToString("yyyy-MMM-dd hh:mm:sss tt"),
                        subject,
                        random.Next(1,4)

                        );
                    Debug.WriteLine(com.CommandText);
                    com.ExecuteNonQuery();
                }
            }
            catch (SqlException sqlEx)
            {
                Debug.Write(sqlEx);
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }
    }
}
