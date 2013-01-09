// =================================================
//          %name: messageDetails.js %
//       %version: 2 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================

//Allows padding of zeros for the purposes of formatting. 
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}