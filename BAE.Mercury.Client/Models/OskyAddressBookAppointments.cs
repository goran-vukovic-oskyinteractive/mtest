using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class AppointmentResult
    {
        private string html;

        public AppointmentResult(string html)
        {
            // TODO: Complete member initialization
            this.html = html;
        }
        public string Html
        {
            get
            {
                return this.html;
            }
        }
    }
    public class Appointment
    {
        //reader["Id"], (string) reader["annotation"], (int) reader["branch"], (string) reader["data"]);
        private int id;
        private string annotation;
        private int branch;
        private string data;

        public Appointment(int id, string annotation, int branch, string data)
        {
            // TODO: Complete member initialization
            this.id = id;
            this.annotation = annotation;
            this.branch = branch;
            this.data = data;
        }
        public int Id
        {
            get
            {
                return id;
            }
        }

        public string BranchName
        {
            get
            {
                switch (branch)
                {
                    case 1:
                        return "Army";
                    case 2:
                        return "Navy";
                    case 3:
                        return "Air Force";
                    default:
                        throw new ApplicationException("invalid ADF branch");
                }
            }
        }

        public string BranchIcon
        {
            get
            {
                switch (branch)
                {
                    case 1:
                        return "icon-abm_army.png";
                    case 2:
                        return "icon-abm_navy.png";
                    case 3:
                        return "icon-abm_raaf.png";
                    default:
                        throw new ApplicationException("invalid ADF branch");
                }
            }
        }

        public string Annotation
        {
            get
            {
                return annotation;
            }
        }
        public string Data
        {
            get
            {
                return data;
            }
        }

    }
    public class OskyAddressBookAppointments
    {
        public List<Appointment> appointments = new List<Appointment>();

    }
}