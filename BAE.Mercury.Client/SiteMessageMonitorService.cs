using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.MmhsModel;


namespace BAE.Mercury.Client
{
    public interface ISiteMessageMonitorService
    {
        List<Folder> AllInboxFolders();
    }
    public class SiteMessageMonitorService : ISiteMessageMonitorService
    {
        public List<Folder> AllInboxFolders()
        {
            List<Folder> folders = new List<Folder>();
            //folders.Add(
            return folders;
        }
    }


}