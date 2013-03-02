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


function nodeplus(nodeId) {
    //remove buttons
    //removeButtons();
    //add a dialog
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

function init() {
    //get the canvas

}

function loadTree(type, id) {
    //ajax call to load
    alert("ajax");
    //return;
    cover();
    //do an ajax call to get HTML




    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            i: 1
        },
        url: "DistributionManagement/ZZZ",
        //async: true,
        beforeSend: function (xhr) {
            alert("before");
        },
        success: function (data) {
            alert("success");
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
        alert("done");
        //init(json);
        //uncover();
    });

    //unfreeze
    uncover();
    return false;
}


$(document).ready(function () {


    $.ajaxSetup({
        cache: false
    });

    $("[id^=s_]").click(function () {
        loadTree(0, this.id);
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
    /*
    $(".sic").click(function () {
    // Holds the product ID of the clicked element
    alert("sic click");
    node_click($(this));
    return false;
    });

    $(".appointment").click(function () {
    // Holds the product ID of the clicked element

    alert("appointment click");
    node_click($(this));
    return false;
    });
    */
    //    alert("OK");

    //    $("#dm_1_1").click = function () {
    //        alert("OK");
    //    }


    //    $("[id^=dm]").click = function () {
    //        alert("OK");
    //    }

})
