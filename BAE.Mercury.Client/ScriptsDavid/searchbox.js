// ============================================================================
//       %name: searchbox.js %
//    %version: 2 %
//   Copyright: Copyright 2012 BAE Systems Australia
//              All rights reserved.
// ============================================================================

$(document).ready(function() {
  $(".dtginput").blur(function (event) { onComplete(event); });
  
  // If the user presses the Enter key then we consider the DTG to be complete.
  $(".dtginput").keypress(function(event) {
    var evt = event ? event : event;
    var charCode;
    charCode = evt.which;
    if (charCode == 13)
    {
      onComplete(event);
    }
  });
});

