// ================================================================================
//          %name: vmSicTreeNodes.cs %
//       %version: 1.1.7 %
//  %date_created: Thu Nov 15 11:00:45 2012 %
//    %derived_by: ADuncan %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Core;
using BAE.Mercury.Client.Client.Dynatree;
using BAE.Mercury.Client.Properties;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    /// <summary>
    /// This is a viewmodel class for the Sic Book hierarchical view.    
    /// Its primary purpose is to map Sic entities to a collection of Dynatree Json
    /// nodes that contain sic-related data.
    /// </summary>
    public class vmSicTreeNodes
    {
        List<DynaTreeNodeJson> sicNodesJson = new List<DynaTreeNodeJson>();        

        public List<DynaTreeNodeJson> SicNodesJson
        {
            get { return sicNodesJson; }
            set { sicNodesJson = value; }
        }

        /// <summary>
        /// This constructor takes a collection of Sic tree nodes and converts them into
        /// a collection objects that can be sent in a response as Json, which will be recognised by
        /// the Jquery Dynatree plugin
        /// </summary>
        /// <param name="sicNodes"></param>
        public vmSicTreeNodes(IEnumerable<SimpleTreeNode<MessageSic>> sicNodes)
        {
            if (sicNodes == null || sicNodes.Count() == 0)
            {
                SicNodesJson.Add(CreateErrorNode());                
            }
            else
            {
                foreach (var sicNode in sicNodes)
                {
                    var sic = sicNode.Value;
                
                    SicNodesJson.Add(
                        new DynaTreeNodeJson
                        {
                            key = sic.Code,
                            title = string.Format("{0} {1}", sic.Code[sic.Code.Length - 1], sic.Description),
                            isLazy = sicNode.HasChildren
                        });
                }
            }
        }

        /// <summary>
        /// Populates a <see cref="DynaTreeNodeJson"/> object with the information needed to
        /// explain to the user that we were unable to provide SIC tree data.
        /// </summary>
        /// <returns></returns>
        private DynaTreeNodeJson CreateErrorNode()
        {
            return new DynaTreeNodeJson
            {
                key = string.Empty,
                //title = ErrorMessages.SicNoRecordsAvailable,
                isLazy = false
            };

        }
        private void Test()
        {
            MessageSic msX = new MessageSic();
            string aaa = msX.Code;

        }
    }


}