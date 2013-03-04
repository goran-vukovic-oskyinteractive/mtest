// =================================================
//          %name: resources.js %
//       %version:  3 %
//      Copyright: Copyright 2013 BAE Systems Australia
//                 All rights reserved.
// =================================================
function getResource(controller,  key )
{
    switch ( controller )
    {
        case "message":
            return MessageResourceObj[key];
            
        default:
            return "";
    }
    
}