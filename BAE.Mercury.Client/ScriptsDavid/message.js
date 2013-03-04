// ============================================================================
//       %name: message.sort.js %
//    %version: 5 %
//   Copyright: Copyright 2012 BAE Systems Australia
//              All rights reserved.
// ============================================================================

$(document).ready(function () {
  $("#criterion li.ReceivedTime").addClass("selected");
  $("#order li.1").addClass("selected");
});

// Send the sort criteria and direction down to the controller and update labels + visual selection.
function callSort(criteria, direction) {
  var text;

  // Has the criteria been changed?
  if (criteria != '') {
    // Remove the "selected" class from all the items in the criterion list
    var nodeC = "#criterion li";
    $(nodeC).removeClass("selected");

    // Replace the saved search field
    gSortField = criteria;

    // Replace the title label of the drop down menu 
    nodeC += "." + gSortField;
    text = $(nodeC).text();
    $("#criteria").text(text);

    // Make the item selected.
    $(nodeC).addClass("selected");
    
    // Modify the labels on the sort ordering
    changeOrderLabels( gSortField );
  }

  // Has the direction label been changed?
  if (direction != -1) {
    // Remove the "selected" class from all the items in the orders list
    var nodeD = "#order li";
    $(nodeD).removeClass("selected");

    // Replace the saved search direction
    gSortDir = direction;

    // Replace the title label of the drop down menu 
    nodeD += "." + gSortDir;
    text = $(nodeD).text();
    $("#orders").text(text);

    // Make the item selected.
    $(nodeD).addClass("selected");
  }

  $( ".message-sort-options" ).hide( 'fast' );
    // Send the selected sort field + direction to the globals and then call loadList.
  loadList(LstObj.CurrentList);
}

// Change the labels in the sort direction drop down menu
function changeOrderLabels(field) {
  var asc, dsc;
  
  // What field is this?
  switch (field) {
    case "ReceivedTime":
      asc = "Oldest";
      dsc = "Newest";
      break;
    case "Security":
      asc = "Unclassified";
      dsc = "Secret";
      break;
    case "Precedence":
      asc = "Routine";
      dsc = "Flash";
      break;
    default:
      asc = "A";
      dsc = "Z";
      break;
  }
  // Add the " on top" bit to both the ascending and descending labels
  asc += " on top";
  dsc += " on top";
  
  // Change the title label for the drop down menu to the ascending order
  $("#orders").text(asc);
  
  // Change the labels in the drop down menu.
  $("#order li.0 a").text(asc);
  $( "#order li.1 a" ).text( dsc );
  $( ".message-sort-options" ).hide( 'fast' );
}