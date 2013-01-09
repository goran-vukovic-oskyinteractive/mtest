using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client
{
    public interface IAddressBookService
    {
        bool ResolveAddressee(string address);
        int GetRootSicNodes();
        //var childSicNodes = addressBookService.GetChildSicNodes(sicId);
        IEnumerable<BAE.Mercury.Client.Client.Dynatree.SimpleTreeNode<BAE.Mercury.Core.MmhsModel.MessageSic>>
        //IEnumerable<MessageSic> 
            GetChildSicNodes(string sicId);

    }
}