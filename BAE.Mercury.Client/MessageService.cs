using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client
{
    public interface IMessageService
    {
        //Paged<Message> pagedMessages = this.messageService.GetMessagesByFolderPaged(listId.Value, null, pageId.Value, RECORDS_PER_PAGE, string.Empty);
        Paged<Message> GetMessagesByFolderPaged(int listIdValue, object something, int pageIdValue, int RECORDS_PER_PAGE, string Empty);
        Paged<Message> GetMessagesByFolderLastPage(int listIdValue, object something, int RECORDS_PER_PAGE, string Empty);
    }

    public class MessageService : IMessageService
    {
        List<Message> _messages = new List<Message>();
        public MessageService()
        {
            for (int i = 0; i < 100; i++)
            {
                Message item = new Message();
                item.Subject = "Merry Christmas " + i;
                _messages.Add(item);
            }

        }
        public Paged<Message> GetMessagesByFolderPaged(int listIdValue, object something, int pageIdValue, int RECORDS_PER_PAGE, string Empty)
        {
            
            Paged<Message> messages = new Paged<Message>();
            messages.AddRange(_messages.GetRange(10, RECORDS_PER_PAGE));
            messages.RowCount = 1;
            return messages;
        }
        public Paged<Message> GetMessagesByFolderLastPage(int listIdValue, object something, int RECORDS_PER_PAGE, string Empty)
        {
            return null;
        }

    }
}