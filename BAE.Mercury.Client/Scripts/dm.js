var IE = navigator.appName == "Microsoft Internet Explorer";


var changes = [];

function Change(type, id, parentId, name) {
    this.type = type;
    this.id = id;
    this.parentId = parentId;
    this.name = name;
}

function addChange(type, id, parentId, name) {
    var change = new Change(type, id, parentId, name);
    changes.push(change);
}

function saveAll() {
    alert("Ok");
    var hidden = $("<div id='cover'><img src='images/ajax-loader.gif' alt='please wait'/><p>please wait</p> </div>"); //style='background-color:green;position:absolute;left:0;top:0;height:100%;width:100%' 
    var body = $("body");

    var sjs = "";// JSON.stringify(changes);
    body.append(hidden);
    //do an ajax call to save
    $.ajax({
        type: "POST",
        url: "/DistributionManagement/Index",
        dataType: "json",
        success: function (data) {
            //var json1 = data;
            //alert(data);
            clear.length = 0;
            uncover();
            init(data);
            //init(json);
        },
        fail: function () {
            alert("fail");
        },
        data: { c: sjs}         //context: document.body
    }).done(function () {
        //alert("done");
        //init(json);
        //uncover();
    });

    //unfreeze
    uncover();
    return false;
}


var sortFunc = function (a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    else if (a.toLowerCase() > b.toLowerCase()) return 1;
    else return 0;
}

function getNewSeqNo(parentNode) {
    var m = 0;

    parentNode.find("span.sic").each(function () {
        var id = this.id;
        //split ids
        var levels = id.split('_');
        var r = parseInt(levels[levels.length - 1]);
        m = (r > m) ? r : m;
    });
    return m;
}

function insertPos(parentNode, name) {
    var pos = -1;
    parentNode.find("span").each(function (index, that) {
        if (pos < 0) {
            var text = that.innerHTML; //assumed span is the first child
            var r = sortFunc(text, name);
            if (r >= 0) {
                pos = index;
            }
        }
    });
    return pos;
}
function insertNode(parentNode, type, name, seqNo) {
}


function addNode(nodeId, type, name) {
    //alert("add node");
    var coreId = nodeId.replace("aa", "");
    //var suffix = nodeId.replace("a", "") + "_" + seqNo;
//    var node = //"<td class='sic' style='background-color:red' id='" + listId + "_" + seqNo + "'><span>" + name + "</td>";
//        "<tr><td class='cinfo'>&nbsp;</td>"
//     + "<td class='sic info' >&nbsp;</td></td>"
//         + "<td class='delete'><a id='id" + suffix + "' href='#'><img src='~/images/icon-minus.png' alt='minus' /></a></td>"
//         + "<td class='edit'><a id='ie" + suffix + "' href='#'><img src='~/images/icon-edit.png' alt='edit' /></a></td></tr>";
//    //    "<tr><td class='cinfo'>&nbsp;</td>"
//     + "<td class='sic info' ><span id='is" + suffix + "' class='sic rounded' >" + name + "</span></td>"
    //     + "<td class='delete'><a id='id" + suffix + "' href='#'><img src='~/images/icon-minus.png' alt='minus' /></a></td>"
    //     + "<td class='edit'><a id='ie" + suffix + "' href='#'><img src='~/images/icon-edit.png' alt='edit' /></a></td></tr>";
    //var n = parentNode.children("tbody").children("tr").eq(0).clone();

    alert("inserting");
    if (type == 1) {
        var tableId = "ti" + coreId;
        var table = $("#" + tableId);
        var pos = insertPos(table, name);
        var seqNo = getNewSeqNo(table);
        var row= table.find("tr");
        var node = row.clone(); 
        var span = node.find("span");
        span[0].innerHTML = name;
        span.attr("id", "#is" + coreId);
        var del = node.find(".delete");
        del.attr("id", "#id" + coreId);
        var edit = node.find(".edit");
        edit.attr("id", "#ie" + coreId);
        //node.find(
        if (pos != -1) {
            alert("here");
            table.children("tbody").children("tr").eq(pos).before(node);
        } else {
            alert("there");
            var tbody = table.children("tbody");
            //alert(tbody[0].innerHTML);
            //node = parentNode.children("tbody").children("tr").eq(0).clone();
            //var child = $(node);
            tbody.append(node);
            alert(tbody[0].innerHTML);
        }

    }
    return;

}



function clicked(id) {
    var node = $("#" + id);
    node_click(node);
}

function updateNode(nodeId, name) {
    alert("update node");
    var liOld = $("#" + nodeId);
    //get the parent

    var list = liOld.parent();
    var listId = list.id;
    //var seqNo = getNewSeqNo(list);
    //var li = "<li class='sic' style='background-color:red' id='" + listId + "_" + seqNo + "'>" + name + "</li>";
    //ins.children.sort(sortFunc);
    //list.append(li);
    var li = liOld.clone();
    liOld.remove();
    li[0].children[0].innerHTML = name;
    insertNode(list, li, name);
    //list.children("li").eq(index).before(li);
    list.find("li").each(function (index, that) {
        var id = that.id;
        var elem = $("#" + id);
        elem.unbind("click");
        elem.bind("click", function (that) { clicked(id); return false; });
        //elem.click ( function (that) { clicked(id); return false; };
        var i = 5;

    });
    return;




}


function deleteNode(nodeId) {
    alert("delete node");
    var liOld = $("#" + nodeId);
    //get the parent

    liOld.remove();
    return;

}



function cancel() {
    $(".xedit").remove();
    uncover();
    return false;
}
function add(nodeId, type) {
    //alert(parentNodeId);
    var nodeEdit = $("#node-edit");
    var nodeType = $("#node-type").val();
    addNode(nodeId, nodeType, nodeEdit[0].value);
    //remove the div
    $(".xedit").remove();

    uncover();
    return false;
}


function edit(nodeId) {
    //alert(parentNodeId);
    var nodeEdit = $("#node-edit");
    //alert(nodeEdit[0].value);
    updateNode(nodeId, nodeEdit[0].value);
    //remove the div
    $(".xedit").remove();

    uncover();
    return false;
}

function remove(nodeId) {
    var nodeEdit = $("#node-edit");
    //alert(nodeEdit[0].value);
    deleteNode(nodeId);
    //remove the div
    $(".xedit").remove();
    uncover();
    return false;
}

/*
function SICinsertAfterFirst()  {
    $("#popup-content .section .inner .col-wrap.select.first:last").clone(true).insertAfter($("#popup-content .section .inner .col-wrap.select.first:last"));
    $("#popup-content .section .inner .col-wrap.select.first input[type='select']").val('');
    return false;
}
function SICinsertAfterSecond()  {
    $("#popup-content .section .inner .col-wrap.select.second:last").clone(true).insertAfter($("#popup-content .section .inner .col-wrap.second:last"));
    $("#popup-content .section .inner .col-wrap.select.second input[type='select']").val('');
    return false;
}

function SICRemoveFirst(event) {
    event.preventDefault();
    $(this).closest("#popup-content .section .inner .col-wrap.select.first").remove();
    return false;
}
function SICRemoveSecond(event) {
    event.preventDefault();
    $(this).closest("#popup-content .section .inner .col-wrap.select.second").remove();
    return false;
}
*/
function nodeplus() {
    //alert(this.id);
    displaySIC($(this)[0].id);
    return;
    alert("add sic");
    //create a sic popup dialog
    var sicPopup = $("#sic-popup");
    var sicPopupNew = sicPopup.clone(true);
    sicPopupNew.attr("id", "sic-popup-new");
    clickRebind(sicPopupNew, "#popup-sic-save", saveSic);
    clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterFirst);
    clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterSecond);
    clickRebind(sicPopupNew, ".btn-minus", SICRemoveFirst);
    clickRebind(sicPopupNew, ".btn-minus", SICRemoveSecond);

/*
        $("#popup-content .section .inner .col-wrap.select.first .btn-plus").click();

        $("#popup-content .section .inner .col-wrap.select.first .btn-minus").click();

        $("#popup-content .section .inner .col-wrap.select.second .btn-minus").click();

        $("#popup-content .section .inner .col-wrap.select.second .btn-plus").click();
*/

    //clickRebind(sicPopupNew, "[id^='msg_']", messageClick);
    //sicPopupNew.find$("[id^='msg_']").each(function () {
    //    $(this).click(function() {messageClick($(this))});
    //    });
    sicPopupNew.css("display", "inline");
    //sicPopup.css("display", "inline");
    $("body").append(sicPopupNew);
    return false;
    var xedit = "<div class='xedit' ><br/><select id='node-type'><option value='1'>1</option><select><br/><input id='node-edit' type='text'/><div style='width:100%;text-align:center;margin:10px'><a href='#' onclick='add(\"" + nodeId + "\")'><img src='images/save.gif' alt='save'/></a>&nbsp;<a href='#' onclick='cancel()'><img src='images/cancel.png' alt='cancel'/></a></div></div>"    //left='" + 400 + "px'
    var body = $("body");
    body.append(xedit);
}
function nodeedit(nodeId) {
    removeButtons();
    //add a dialog
    var xedit = "<div class='xedit' ><br/><select id='node-type'><option value='1'>1</option><select><br/><input id='node-edit' type='text'/><div style='width:100%;text-align:center;margin:10px'><a href='#' onclick='edit(\"" + nodeId + "\")'><img src='images/save.gif' alt='save'/></a>&nbsp;<a href='#' onclick='cancel()'><img src='images/cancel.png' alt='cancel'/></a></div></div>"    //left='" + 400 + "px'
    var body = $("body");
    body.append(xedit);
}

function nodeminus(nodeId) {
    removeButtons();
    //add a dialog
    var xedit = "<div class='xedit' ><div>Delete this node?</div><div style='width:100%;text-align:center;margin:10px'><a href='#' onclick='remove(\"" + nodeId + "\")'><img src='images/save.gif' alt='save'/></a>&nbsp;<a href='#' onclick='cancel()'><img src='images/cancel.png' alt='cancel'/></a></div></div>"    //left='" + 400 + "px'
    var body = $("body");
    body.append(xedit);
}






function getNodeDepth(id) {
    return id.split('_').length - 2;
}

function coverClick() {
    //alert("cover click");
    //remove buttons
    var nodeButtons = $(".node-buttons");
    if (nodeButtons.length > 0) {
        //we remove the cover only if the buttons were unclicked
        removeButtons();
        //remove cover div
        uncover();
    }
}

function uncover() {
    $("#cover").remove();
    //    var cover = $("#cover");
    //    if (cover.length > 1)
    //        throw new Error("more than one covering div");
    //    cover.remove();
    var cover1 = $("#cover");
    if (cover1.length > 0)
        throw new Error("cover not removed");

}




function cover() {
    var hidden = $("<div id='cover' onclick='coverClick()'></div>"); //style='background-color:green;position:absolute;left:0;top:0;height:100%;width:100%' 
    var body = $("body");
    body.append(hidden);
}


        // script to duplicate the row for the select field.



function clickRebind(parent, pattern, func) {
    parent.find(pattern).each(function () {
        $(this).click(func);
        });
}


function init(data) {
    //get the graph
    var graph = $("#graph");
    graph.empty();
    //alert(data);
    graph.append(data);
    clickRebind(graph, "a[id^='aa_']", nodeplus);
    clickRebind(graph, "a[id^='ie_']", null);
    clickRebind(graph, "a[id^='id_']", null);
    clickRebind(graph, "a[id^='ae_']", null);
    clickRebind(graph, "a[id^='ad_']", null);
    //var trigger = $("#rule-visualiser-wrap-trigger");
//    graph.find("a[id^='a_']").each(function () {
//        $(this).click(function() {alert("add");});
//        });
//    graph.find("a[id='*d_']").each(function () {
//        $(this).click(function() {alert("edit");});
//        });
//    graph.find("a[id='*a_']").each(function () {
//        $(this).click(function() {alert("add");});
//        });
//    //var graph = $("#graph");
    //var height = $("#graph").css("height");
    //var nice = graph.getNiceScroll();
    //nice.remove();
    //nice.resize();
    //nice.show();
    //event.preventDefault();
    //$("#graph").getNiceScroll().resize();
    //$("#rule-visualiser-wrap-trigger").click(); //.slideToggle("normal");		

//    $("#graph .node.expandible .expand").niceScroll({
    //        autohidemode: false,
    //        cursorborder: "none",
    //        cursorcolor: "#6c6c6c",
    //        zindex: 999
    //    });	
//    

}

function loadTree(id) {
    //ajax call to load
    //alert("ajax");
    //return;
    cover();
    //do an ajax call to get HTML




    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            i: id
        },
        url: "DistributionManagement/GetSet",
        //async: true,
        beforeSend: function (xhr) {
            //alert("before");
        },
        success: function (data) {
            //alert("success");
            //get canvas
            //var canvas =  $(
            //var json1 = data;
            //alert(data);
            uncover();
            init(data);
            //init(json);
        },
        fail: function () {
            alert("fail");
        }
       
    }).done(function () {
        //alert("done");
        //init(json);
        //uncover();
    });

    //unfreeze
    uncover();
    return false;
}
function highlightControl(control) {
    control.css("background-color", "#faa");
}
function errorMessage(error) {
    alert(error);
    return false;
}

function sicValidate(sicList, data) {
    var valid = true;
    var found = false;
    sicList.find("[id^='entry']").each(function () {
        found = true;
        var entry = new Object();
        var privacyNode =  $(this).find(".privacy");
        var privacy =  privacyNode.prop("selectedIndex");
        if (privacy < 1) {
            highlightControl(privacyNode);
            valid = false;
        } else {
            entry.privacy = privacy;
        }
        var searchNode =  $(this).find(".search");
        var search =  searchNode.prop("selectedIndex");
        if (search < 1) {
            highlightControl(searchNode);
            valid = false;
        } else {
            entry.search = search;
        }
        var nameNode =  $(this).find(".name")
        var name =  nameNode.val();
        if (!name) {
            highlightControl(nameNode);
            valid = false;
        } else {
            entry.name = name;
        }
        data.entries.push(entry);
        data.name = (data.name)? data.name + " or " + entry.name : entry.name;
    });
    
    if (!found){
        return errorMessage("there must be at least one entry");
    }
    var sicPopupNew = $("#sic-popup-new");
    var sicPopupTypeNode = sicPopupNew.find($(".type"));
    var type = sicPopupTypeNode.prop("selectedIndex");
    if (type < 1) {
        highlightControl(sicPopupTypeNode);
        valid = false;
    }    
    if (!valid) {
        return errorMessage("please enter data in the empty fields highlighted red");
    }
    data.type = type;
    return true;
}

function sicSave(id) {

    alert("save sic");
    var data;
    addNode(id, 1, "AAAAA");
    return;
    //validate entries
    var sicList =  $("#sic-list-new");
    //var id = sicList.attr("origin");
    var data = {type: null, name: null, entries:[]};
    if (sicValidate(sicList, data)) {
        //what is the parent node
        var split = id.split("_");
        if (split[0] == "aa") {
            //new node
            //assemble data for node name
            //if (data.type == 1) 
            addNode(id, data.type, data.name);
            var aaa= 5;
        } else if (split[0] == "ie"){
            addNode(id, "action", "aaaaa");
            //find the node that clicked
//            var node = $("#" + id.replace("ie", "is"));        
//            node.text("aaaaaa");
        } else if (split[0] == "ae"){
            addNode(id, "action", "aaaaa");
//            var node = $("#" + id.replace("ae", "as"));
//            node.text("aaaaaa");
        } else {
            throw new Error("invalid button type");
        }
    }
        return false;
}

function addEntry() {
    var sicList =  $("#sic-list-new");
    var i = sicList.find("[id^='entry']").length; //[id^='msg_']
    var maxEntries = 15;
    if (i > maxEntries) {
        alert("reached the maximum of " + maxEntries + " entries");
        return false;    
    }
    var template = $("#sic-entry-template");
    var instance = getInstance(template, null, i);
    clickRebind(instance, ".btn-minus", removeEntry);
    sicList.append(instance);
    return false;
}
function removeEntry() {
    var sicList =  $("#sic-list-new");
    var instance = sicList.find("#" + this.id.substring(2));
    instance.remove();
    return false;
}

function getInstance(template, data, i) {
    var instance = template.clone(true);
    var entryId = "entry" + i;
    instance.attr("id", entryId);
    if (data) {
        var privacy = instance.find(".privacy");
        privacy.prop("selectedIndex", data.privacy);
        var search = instance.find(".search");
        search.prop("selectedIndex", data.search);
        var name = instance.find(".name");
        name[0].innerText = data.name;
    }
//    var seq = instance.find(".sequence");
//    seq.text(i);
    var del = instance.find(".btn-minus");
    del.attr("id", "d_" + entryId);
    return instance;
}

function test(id) {
    alert(id);
}

function displaySIC(id) {
    //data = [{'privacy': 1, 'search': 2, 'name' :'cccccc'},{'privacy': 1, 'search': 2, 'name' :'cccccc'}];

    var sicPopup = $("#sic-popup");
    var sicPopupNew = sicPopup.clone(true);
    sicPopupNew.attr("id", "sic-popup-new");
    var sicList =  sicPopupNew.find("#sic-list");
    sicList.attr("id", "sic-list-new");
    //clickRebind(sicPopupNew, "#popup-sic-save", saveSic);
    //clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterFirst);
    //clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterSecond);
    //clickRebind(sicPopupNew, ".btn-minus", SICRemoveFirst);
    //clickRebind(sicPopupNew, ".btn-minus", SICRemoveSecond);
    sicList.css("background-color", "red");
    sicList.attr("origin", id);
    var template = $("#sic-entry-template");
    //template.attr("id", "sic-popup-new-1");
    //var template1 = $("#sic-entry-template").clone(true);
    //template1.attr("id")., "sic-popup-new-2");
    //sicListNew.append(template1);

    //(Privacy marking = CCCCC or Privacy marking = DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
    clickRebind(sicPopupNew, ".btn-plus", addEntry);
    clickRebind(sicPopupNew, "#popup-sic-save", function () { sicSave(id);});
    sicPopupNew.css("display", "inline");
    $("body").append(sicPopupNew);
    //
    return;
    //populate the list
    var template = $("#sic-entry-template").clone(true);var sicList = $("#sic-list");
    sicPopupNew.append("<p>aaaaaa</p>");
    $("body").append(sicPopupNew);
    sicPopupNew.css("display", "inline");
    sicPopupNew.css("background-color", "red");
    sicPopupNew.css("width", "2000px");

    return sicList;
};

function populateSic(data) {
    var sicPopupNew = $("sic-popup-new");
    var sicList =  sicPopupNew.find("#sic-list");
    if (data) {
        for(var i = 0; i < data.length; i++) {
            if (i > 25)
                throw new Error("too many entries");    
            var instance = getInstance(template, data[i], i);
            sicList.append(instance);

            /*
            var instance = template.clone(true);
            var entryId = "entry" + i;
            instance.attr("id", entryId);
            var privacy = instance.find(".privacy");
            privacy.prop("selectedIndex", data[i].privacy);
            var search = instance.find(".search");
            search.prop("selectedIndex", data[i].search);
            sicListNew.append(instance);
            var name = instance.find(".name");
            name[0].innerText = data[i].name;
            var del = instance.find(".btn-minus");
            del.attr("id", "d_" + entryId);
            //var plus = sicListNew.find(".btn-plus");
            */
        }
        clickRebind(sicPopupNew, ".btn-minus", removeEntry);
    }
}



function closePopupSic() {
    alert("closing sic");
    var sicPopupNew = $("#sic-popup-new");
    sicPopupNew.remove();
}



function messageClick() {
    //we have the jQuery object
    var url = $(this).attr("data-url");
    alert(url);
}

function closeList() {
    alert("closing");
    var emailListNew = $("#email-list-new");
    emailListNew.remove();
}

function noClick(event) {
        return false;
}

function blah() {
    alert("blah");
}
function selectMessage() {

var emailList = $("#email-list");
var emailListNew = emailList.clone(true);
emailListNew.attr("id", "email-list-new");
clickRebind(emailListNew, "[id^='msg_']", messageClick);
clickRebind(emailListNew, "#message-list-wrap", noClick);


//emailListNew.find$("[id^='msg_']").each(function () {
//    $(this).click(function() {messageClick($(this))});
//    });
emailListNew.css("display", "inline");
//emailList.css("display", "inline");
$("body").append(emailListNew);

addListContainerScroll();
};

$(document).ready(function () {


//$(".popup").click = function () {alert("OK")};

    //    $("#graph").scroll(function () {
    //        $("#graph").getNiceScroll().resize();
    //    });
    //    var graph = $("#graph");
    //    var nice = graph.getNiceScroll();
    //    nice.remove();


    $.ajaxSetup({
        cache: false
    });

    $("[id^=s_]").click(function () {
        //alert("set" + this.id);
        loadTree(this.id);
        return;
        var graph = $("#graph");
        var height = graph.height();
        graph.height(2000); // css("height", "2000px");
        var nice = graph.getNiceScroll();
        //        //nice.remove();
        //        nice.resize();
        //        nice = graph.niceScroll({

        //                    cursorcolor: "#CCC",
        //                    autohidemode: false,
        //                    cursorborder: "none",
        //                    cursorcolor: "#6c6c6c",
        //                    zindex: 999


        //        });
        //$("graph").getNiceScroll().resize();
        //nice.resize();
        var h = graph.height();
        //$('div[id^="ascrail"]').remove();
        nice.remove();
        $("#graph").niceScroll({
                        cursorcolor : "#6699FF",
                        cursorwidth : "50px",
                        grabcursorenabled : "false",
                        preservenativescrolling : "false",
                        cursorborder : "0px",
                        scrollspeed : "20",
                    });
        var wh = $(window).height();//.resize(-1, -1);
        var ww = $(window).width();//.resize(-1, -1);
        var newWH = wh + 20;
        window.resizeBy(0, -20);
        window.resizeBy(0, +21);

        //saveAll();
        //alert("set" + this.id);
        //cover();
        return false;
    });



    $(".edit").click(function () {
        alert("edit");
        cover();
        return false;
    });

    $(".remove").click(function () {
        alert("minus");
        cover();
        return false;
    });
    $(".name").focus(function () {
        $(this).css("background-color", "inherit");
        return false;
    });

    

})
