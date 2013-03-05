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

    parentNode.find(".sic").each(function () {
        var id = this.id;
        //split ids
        var levels = id.split('_');
        var r = parseInt(levels[levels.length - 1]);
        m = (r > m) ? r : m;
    });
    return m;
}

function insertPos(parentNode, node, name) {
    var pos = -1;
    parentNode.find("sic").each(function (index, that) {
        if (pos < 0) {
            var text = that.children[0].innerText; //assumed span is the first child
            var r = sortFunc(text, name);
            if (r >= 0) {
                pos = index;
            }
        }
    });
    return pos;
}
function insertNode(parentNode, type, name, seqNo) {
    var pos = insertPos(parentNode, node, name);
    var node = $("#ta_x").children("tbody").children("tr").eq(0).clone();
    node.find("#as_x_0").html("AAAAA");
    node.find("#ad_x_0").attr("id", "ie_5");
    node.find("#ae_x_0").attr("id", "ie_6");

    if (pos != -1)
        parentNode.children("tbody").children("tr").eq(pos).before(node);
    else {
        var tbody = parentNode.children("tbody");
        //alert(tbody[0].innerHTML);
        //node = parentNode.children("tbody").children("tr").eq(0).clone();
        //var child = $(node);
        tbody.append(node);
        alert(tbody[0].innerHTML);
    }
}


function addNode(nodeId, type, name) {
    alert("add node");
    var listId = nodeId.replace("a", "ti");
    var list = $("#" + listId);
    var seqNo = getNewSeqNo(list);
    var suffix = nodeId.replace("a", "") + "_" + seqNo;
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

    insertNode(list, type, name, seqNo);
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

function nodeplus() {
    selectSic();
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
    clickRebind(graph, "a[id^='a_']", nodeplus);
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

function saveSic() {
    alert("save sic");
}

function selectSic(data) {
//data = [{'privacy': 'aaaa', 'search': 'bbbbb', 'name' :'cccccc'},{'privacy': 'aaaa', 'search': 'bbbbb', 'name' :'cccccc'}];
var sicPopup = $("#sic-popup");
var sicPopupNew = sicPopup.clone(true);
sicPopupNew.attr("id", "sic-popup-new");
//clickRebind(sicPopupNew, "#popup-sic-save", saveSic);
//clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterFirst);
//clickRebind(sicPopupNew, ".btn-plus", SICinsertAfterSecond);
//clickRebind(sicPopupNew, ".btn-minus", SICRemoveFirst);
//clickRebind(sicPopupNew, ".btn-minus", SICRemoveSecond);
sicPopupNew.css("background-color", "red");
sicPopupNew.css("width", "2000px");
sicPopupNew.css("display", "inline");
$("body").append(sicPopupNew);
return;
//populate the list
var template = $("#sic-entry-template").clone(true);
var sicList = $("#sic-list");
sicPopupNew.append("<p>aaaaaa</p>");
//for(instance in data) {    
//    sicList.append("<p>aaaaaa</p>");
//}
//
$("body").append(sicPopupNew);
sicPopupNew.css("display", "inline");
sicPopupNew.css("background-color", "red");
sicPopupNew.css("width", "2000px");

};


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



    //alert("reday");
    //$(".rounded").corner('3px');
    $("[id^=a_]").click(function () {
        alert("plus");
        cover();
        var id = $(this)[0].id;
        nodeplus(id);
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

})
    $(document).ready(function () {

    });
