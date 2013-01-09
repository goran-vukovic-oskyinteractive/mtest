
// ================================================================================
//          %name: vmFolder.cs %
//          %version: 7 %
//          %date_created: Tue Nov 27 16:13:59 2012 %
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
    public class vmFolder
    {
        [Key]
        public int FolderID { get; set; }
        [Required]
        public int ParentFolderID { get; set; }
        [Required]
        public string Title { get; set; }
        public string Icon1
        {
            get { return "folder_docs.gif"; }
            set { }
        }
        public string Icon2 { get; set; }

        // recursive list of vmFolder objects
        public List<vmFolder> ChildFolders = new List<vmFolder>();

        // single line constructor for this class
        public vmFolder(int id,
            string title,
            int parentid = 0,
            string icon1 = "",
            string icon2 = "")
        {
            this.FolderID = id;
            this.ParentFolderID = parentid;
            this.Title = title;
            this.Icon1 = icon1;
            this.Icon2 = icon2;
        }

        public vmFolder() { }

        //static test data
        public static List<vmFolder> UserFolders()
        {
            List<vmFolder> Folders = new List<vmFolder>();

            Folders.Add(new vmFolder(1, "Inbox", 0));
            Folders[0].ChildFolders.Add(new vmFolder(2, "Appointment/Unit", 1));
            Folders[0].ChildFolders.Add(new vmFolder(3, "Appointment 2", 1));

            Folders.Add(new vmFolder(4, "Draft", 0));
            Folders[1].ChildFolders.Add(new vmFolder(5, "Appointment/Unit", 4));
            Folders[1].ChildFolders.Add(new vmFolder(6, "Appointment 2", 4));

            Folders.Add(new vmFolder(7, "Sent", 0));
            Folders[2].ChildFolders.Add(new vmFolder(8, "Appointment/Unit", 7));
            Folders[2].ChildFolders.Add(new vmFolder(9, "Appointment 2", 7));
         
            Folders.Add(new vmFolder(10, "Discard", 0));
            Folders[3].ChildFolders.Add(new vmFolder(11, "Appointment/Unit", 10));
            Folders[3].ChildFolders.Add(new vmFolder(12, "Appointment 2", 10));

            Folders.Add(new vmFolder(13, "Templates", 0));
            Folders[4].ChildFolders.Add(new vmFolder(14, "Appointment/Unit", 13));
            Folders[4].ChildFolders.Add(new vmFolder(15, "Appointment 2", 13));

            Folders.Add(new vmFolder(16, "Objective", 0));
            Folders[5].ChildFolders.Add(new vmFolder(17, "Appointment/Unit", 16));
            Folders[5].ChildFolders.Add(new vmFolder(18, "Appointment 2", 16));

            //Folders.Add(new vmFolder(13, "Templates", 0));
            //Folders[4].ChildFolders.Add(new vmFolder(14, "Templates sub 1", 13));
            //Folders[4].ChildFolders.Add(new vmFolder(15, "Templates sub 2", 13));
            //Folders[4].ChildFolders.Add(new vmFolder(16, "Templates sub 3", 13));
            //Folders[4].ChildFolders.Add(new vmFolder(17, "Templates sub 4", 13));
            //Folders[4].ChildFolders[2].ChildFolders.Add(new vmFolder(18, "Appointment/Unit", 16));
            //Folders[4].ChildFolders[2].ChildFolders.Add(new vmFolder(19, "Appointment 2", 16));

            return Folders;
        }

        /// <summary>
        /// Factory constructor for a vmFolder list from (domain) model
        /// </summary>
        /// <param name="folders"></param>  domain model folders collection
        /// <returns></returns>
        public static List<vmFolder> FolderList(IEnumerable<Core.MmhsModel.Folder> folders)
        {
            var vmFolders = new List<vmFolder>();
            foreach (var folder in folders)
            {
                var parentFolderId = folder.ParentFolder == null ? 0 : folder.ParentFolder.Id;
                var newVmFolder = new vmFolder() { FolderID = folder.Id, ParentFolderID=parentFolderId, Title= folder.DisplayName};
                populateChildFoldersOf(folder, newVmFolder, folders);
                vmFolders.Add(newVmFolder);
            }
            return vmFolders;
        }

        /// <summary>
        /// Recursively populate child folders of the view model folder.
        /// Assumes that adding the child folders to the top-level vm list is done by the caller.
        /// </summary>
        /// <param name="folder"></param> the folder with possible children
        /// <param name="newVmFolder"></param> view model fodler to populate with subfolders
        /// <param name="folders"></param> collection of all folders to work from
        protected static void populateChildFoldersOf(Core.MmhsModel.Folder folder, vmFolder newVmFolder, IEnumerable<Core.MmhsModel.Folder> folders)
        {
            newVmFolder.ChildFolders = new List<vmFolder>();
            if (folder.ChildFolders.Count > 0)
            {
                foreach (var childFolder in folder.ChildFolders)
                {
                    var parentFolderId = folder.ParentFolder == null ? 0 : folder.ParentFolder.Id;
                    var newVmChildFolder = new vmFolder() { FolderID = childFolder.Id, ParentFolderID=parentFolderId, Title=childFolder.DisplayName };
                    newVmFolder.ChildFolders.Add(newVmChildFolder);
                    populateChildFoldersOf(childFolder, newVmChildFolder, folders);
                }

            }
        }
    }
}