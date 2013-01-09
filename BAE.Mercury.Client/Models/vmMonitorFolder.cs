
// ================================================================================
//          %name: vmMonitorFolder.cs %
//          %version: 1 %
//          %date_created: Tue Nov 27 16:13:54 2012 %
//          %derived_by:LLawley %
//          Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    ///  View model for Folder structure
    /// </summary>
    public class vmMonitorFolder : vmFolder
    {
        // single line constructor for this class
        public vmMonitorFolder(int id,
            string title,
            int parentid = 0,
            string icon1 = "",
            string icon2 = "") : base(id, title, parentid, icon1, icon2)
        {
        }

        public vmMonitorFolder():base() { }

        /// <summary>
        /// Factory constructor for a vmFolder list from (domain) model
        /// </summary>
        /// <param name="folders"></param>  domain model folders collection
        /// <returns></returns>
        public static new List<vmMonitorFolder> FolderList(IEnumerable<Core.MmhsModel.Folder> folders)
        {
            var vmFolders = new List<vmMonitorFolder>();
            foreach (var folder in folders)
            {
                var parentFolderId = folder.ParentFolder == null ? 0 : folder.ParentFolder.Id;
                var newVmFolder = new vmMonitorFolder() { FolderID = folder.Id, ParentFolderID = parentFolderId, Title = folder.DisplayName };
                populateChildFoldersOf(folder, newVmFolder, folders);
                vmFolders.Add(newVmFolder);
            }
            return vmFolders;
        }
    }
}