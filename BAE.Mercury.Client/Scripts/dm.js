﻿var IE = navigator.appName == "Microsoft Internet Explorer";
var JQID =   [{},{"table" : "at", "row" : "ar", "text" : "as", "edit" : "ae", "del" : "ad"}, {"table" : "it", "row" : "ir", "text" : "is", "edit" : "ie", "del" : "id"}];

function $ID(id) {
    return $("#" + id);
}
function $CLASS(class) {
    return $("." + id);
}

function Format(p1,p2,p3,p4) {
    return "[" + p1 + "," + p2 + "," + p3 + "," + p4 + "]";
}

function htmlEncode(value){ 
    if (value) {
        var div = $('<div/>');        
        return div.text(value).html();
    } else {
        return '';
    }
}
function Entry(rule, match, name) {
    this.Rule = rule;
    this.Name = name;
    this.Match = match;
}


function SicData(type) {
    this.Type = type;
    this.Children = [];
//        var entry = {"type":data[i][0], "match":sicData[i][1], "name":longName.substr(sicData[i][2], sicData[i][3])};
    this.AddChild = function(entry) {
        this.Children.push(entry);
    }
}

//string name, bool readOnly, RuleType ruleType, MatchType matchType)
function DMrule(name, ruleType, matchType) {
    this.Name = name;
    this.RuleType = ruleType;
    this.MatchType = matchType;
    this.EnMatchType = {Equal : 1, StartsWith : 2};
    this.EnRuleType = {SIC : 1, PrivacyMarking : 2};
}
function DMsic(type) {
    this.Type = type;
    this.Children = [];
    this.longName = "(";
    this.data="[";

//    this.AddChild = function (entry) {
//        this.Children.push(entry);
//    }
//
    this.Data = function() {
        var text = this.data;
        return text+ "]";
    }
    this.LongName = function() {
        return this.longName + ")";
    }
    this.AddNode = function(rule) {
    //var rule = DMrule(entry.name, entry.rule, entry.match);
    if (this.Children.length > 0)
    {
        if ((this.Children[this.Children.length - 1]).Rule == rule.Rule)
            this.longName += " OR ";
        else
            this.longName += ") AND (";
    }
    if (rule.Rule == (new DMrule()).EnRuleType.PrivacyMarking)
    {
        this.longName += "Privacy Marking";
    }
    else
    {
        this.longName += "SIC";
    }
    if (rule.Match == (new DMrule()).EnMatchType.StartsWith)
    {
        this.longName += " starts with ";
    }
    else
    {
        this.longName += " = ";
    }
    var name = htmlEncode(rule.Name);
    //data for rules [rule type, match, start position, length]
    if (this.Children.length > 0)
    {
        var i = 6;
    }
    this.data +=((this.Children.length > 0) ? "," : "") + Format(rule.Rule, rule.Match, this.longName.length, rule.Name.length);
    this.longName += name;
    this.Children.push(rule);    
    }

}

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
    parentNode.find("span.sic").each(function (index, that) {
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


function assembleName(data) {
    for (var i =0; i < data.entries.length; i++) {
        addChild(data.entries[i]);
    }

}


function updateNode(id, data) {
    alert("update node");
    var jqIds = JQID[data.Type]; // {"table" : "#i", "text" : "#is", "edit" : "#ie", "del" : "#id"} : {"table" : "#ta", "text" : "#as", "edit" : "#ae", "del" : "#ad"};
    var ids= id.split("_");
    var coreId = "_" + ids[1] + "_" + ids[2] + "_" + ids[3];
    var table = $ID(jqIds.table + coreId);
    //var table = $ID(tid);
    var test = $("#at_4_5_8").html();
    var name = data.LongName();
    var rowId = id.replace("e", "r");
    var rowOld = $ID(rowId);
    var row = rowOld.clone(true);
    var spanName = row.find("span.sic");
    spanName.html(name);
    var spanData = row.find("span.sic-data");
    var sicData = data.Data();
    spanData.html(sicData);
    rowOld.remove();
    var pos = insertPos(table, name);

//    var del = row.find(".delete");
//    del.attr("id", jqIds.del + coreId);
//    del.click(nodeMinus);
//    var edit = row.find(".edit");
//    edit.attr("id", jqIds.edit + coreId);
//    edit.click(nodeEdit);
//    //row.find(
    if (pos != -1) {
        alert("other rows");
        //table.find("tr").eq(pos).before(row);
        table.children("tbody").children("tr").eq(pos).before(row);
    } else {
        alert("no other rows");
        var tbody = table.find("tbody");
        //alert(tbody[0].innerHTML);
        //node = parentNode.children("tbody").children("tr").eq(0).clone();
        //var child = $(node);
        tbody.append(row);
        //alert(tbody[0].innerHTML);
    }

}

function newNode(id, data, action) {


    //alert("add node");
    var jqIds = JQID[data.Type]; // == 1) ?  {"table" : "#i", "text" : "#is", "edit" : "#ie", "del" : "#id"} : {"table" : "#ta", "text" : "#as", "edit" : "#ae", "del" : "#ad"};
    var templateTable = $($ID(jqIds.table) + "_0_0_0");
    var templateRow= templateTable.find("tr");
    var row = templateRow.clone(); 
    var ids= id.split("_");
    var coreId = "_" + ids[1] + "_" + ids[2] + "_" + ids[3];
    var tid = $ID(jqIds.table) + coreId;
    var table = $(tid);
    var name = data.LongName();
    if (action == 0) {
        //we are inserting, a new id
        var rid = $ID(jqIds.row) + coreIdExt;
        row.attr("id", rid);
    } else {
        //we keep the old row id
    }
    var pos = insertPos(table, name);
    var seqNo = getNewSeqNo(table);
    //row id must be like "#ar_1_2_15_?"
    var coreIdExt = coreId + "_" + seqNo;
    var span = row.find("span.sic");
    span.html(data.LongName());
    span.attr("id", jqIds.text + coreId);
    var sicData = row.find("span.sic-data");
    var xxxx = data.Data();
    sicData.html(xxxx);
    var del = row.find(".delete");
    del.attr("id", jqIds.del + coreId);
    del.click(nodeMinus);
    var edit = row.find(".edit");
    edit.attr("id", jqIds.edit + coreId);
    edit.click(nodeEdit);
    //row.find(
    if (pos != -1) {
        alert("no other rows");
        //table.find("tr").eq(pos).before(row);
        table.children("tbody").children("tr").eq(pos).before(row);
    } else {
        alert("other rows");
        var tbody = table.find("tbody");
        //alert(tbody[0].innerHTML);
        //node = parentNode.children("tbody").children("tr").eq(0).clone();
        //var child = $(node);
        tbody.append(row);
        //alert(tbody[0].innerHTML);
    }


}




function nodePlus() {
    var id = $(this)[0].id;
    var prefix = id.split("_")[0];
    if (!(prefix== "aa"))
        throw new Error("invalid edit type");
    alert("add sic");
    var sicData = new SicData(null);
    var sicDialog = sicDisplay(id, function () { sicSave(id, 1, sicDialog, sicData)});
    return;
}
function nodeEdit() {
    var id = $(this)[0].id;
    var prefix = id.split("_")[0];
    if (!(prefix== "ae" || prefix == "ie"))
        throw new Error("invalid edit type");
    //alert("edit sic");
    var data = getSicData(id);
    var sicDialog = sicDisplay(id, function () { sicSave(id, 0, sicDialog, data)});
    sicPopulate(sicDialog, data);
    return;
    removeButtons();
    //add a dialog
    var xedit = "<div class='xedit' ><br/><select id='node-type'><option value='1'>1</option><select><br/><input id='node-edit' type='text'/><div style='width:100%;text-align:center;margin:10px'><a href='#' onclick='edit(\"" + nodeId + "\")'><img src='images/save.gif' alt='save'/></a>&nbsp;<a href='#' onclick='cancel()'><img src='images/cancel.png' alt='cancel'/></a></div></div>"    //left='" + 400 + "px'
    var body = $("body");
    body.append(xedit);
}

function nodeMinus(nodeId) {
    var id = $(this)[0].id;
    var prefix = id.split("_")[0];
    if (!(prefix== "ad" || prefix == "id"))
        throw new Error("invalid delete type");
    alert("remove sic");
    return;
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
    //alert(data);
    //get the graph
    var graph = $("#graph");
    graph.empty();
    graph.append(data);
    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='ad_']", nodeMinus);
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
    return null;
}

function sicValidate(sicPopup) {

    var valid = true;
    var found = false;
    var sicPopupType = sicPopup.find("#sic-type");
    var type = sicPopupType.prop("selectedIndex");
    var data = new DMsic(type);
    if (type < 1) {
        highlightControl(sicPopupTypeNode);
        valid = false;
    }    
    else    
        sicPopup.list.find("[id^='entry']").each(function () {
            found = true;
            var ruleCtl =  $(this).find(".rule");
            var rule =  ruleCtl.prop("selectedIndex");
            if (rule < 1) {
                highlightControl(ruleCtl);
                valid = false;
            } 
            var matchCtl =  $(this).find(".match");
            var match =  matchCtl.prop("selectedIndex");
            if (match < 1) {
                highlightControl(matchCtl);
                valid = false;
            }
            var nameCtl =  $(this).find(".name");
            var name =  nameCtl.val();
            if (!name) {
                highlightControl(nameCtl);
                valid = false;
            }
            var entry = new Entry(rule, match, name);
            data.AddNode(entry);
        });
    
    if (!found){
        return errorMessage("there must be at least one entry");
    }
    if (!valid) {
        return errorMessage("please enter data in the empty fields highlighted red");
    }
    return data;
}


function sicChanged() {
    var sicPopup = $("#sic-popup");
    var typeList =sicPopup.find("#sic-type");
    typeList.prop("selectedIndex", (prefix == "ae") ? 1 : 2);
    //get the data
    var rowId = id.replace("e", "r");     
    var row = $("#" + rowId);
    var longName = row.find(".sic").text();
    var dataElement = row.find(".sic-data");
    var sicData = eval(dataElement.text());
    var template = $("#sic-entry-template");

}
function deleteNode(id) {
    var node = $("#" + id);
    node.remove();
}

function isEqual(data, oldData) {
    //to do
    return false;
}
function sicSave(id, action, sicPopup, oldData) {

    alert("save sic");
//    var data;
//    insertNode(id, "ZZZZA");
//    closePopupSic();
//    return;
    //validate entries
    //var sicPopup = $("#sic-popup-new");
    //var sicList =  sicPopup.list; //find("#sic-list-new");
    //var id = sicList.attr("origin");
    var test = $("#at_4_5_8").html();
    var data = sicValidate(sicPopup);
    if (data) {
        if (action == 0) {
            if (!isEqual(data, oldData)) {               
                updateNode(id, data);
            }
        }
        else 
            insertNode(id, data);
        closePopupSic();
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
    var entry = createEntry(template, null, i);
    //clickRebind(entry, ".btn-minus", removeEntry);
    sicList.append(entry);
    return false;
}
function removeEntry() {
    alert("remove entry");
    var sicList =  $("#sic-list-new");
    var entry = sicList.find("#" + this.id.substr(2));
    entry.remove();
    return false;
}

function createEntry(template, data, i) {
    var entry = template.clone(true);
    if (data) {
        if (!(data.Rule == 1 || data.Rule == 2))
            throw new Error("invalid data.type"); 
        if (!(data.Match == 1 || data.Match == 2))
            throw new Error("invalid data.match"); 
        if (!(data.Name.length > 0))
            throw new Error("invalid data.name"); 
        var rule = entry.find(".rule");
        rule.prop("selectedIndex", data.Rule);
        var match = entry.find(".match");
        match.prop("selectedIndex", data.Match);
        var name = entry.find(".name");
        name.val(data.Name);
    }
    //else we are adding a blank entry
    var entryId = "entry" + i;
    entry.attr("id", entryId);
    var del = entry.find(".btn-minus");
    del.attr("id", "d_" + entryId);
    del.click(removeEntry);
    return entry;
}

function populateSic(id, sicPopup, sicList, prefix) {
    //data = [{'privacy': 1, 'search': 2, 'name' :'cccccc'},{'privacy': 1, 'search': 2, 'name' :'cccccc'}];
    //set the type
    if (!(prefix== "ae" || prefix == "ie"))
        throw new Error("invalid edit type");
    var typeList =sicPopup.find("#sic-type");
    typeList.prop("selectedIndex", (prefix == "ae") ? 1 : 2);
    //get the data
    var rowId = id.replace("e", "r");     
    var row = $("#" + rowId);
    var longName = row.find(".sic").text();
    var dataElement = row.find(".sic-data");
    var sicData = eval(dataElement.text());
    var template = $("#sic-entry-template");
    for(var i = 0; i < sicData.length; i++) {
        if (i > 25)
            throw new Error("too many entries");
        var data = {"type":sicData[i][0], "match":sicData[i][1], "name":longName.substr(sicData[i][2], sicData[i][3])};
        var entry = createEntry(template, data, i);
        sicList.append(entry);

    }
}
function getSicData (id) {
    //data = [{'privacy': 1, 'search': 2, 'name' :'cccccc'},{'privacy': 1, 'search': 2, 'name' :'cccccc'}];
    //set the type
    var type = (id.split("_")[0] == "ae") ? 1 : 2;
    //var typeList =sicPopup.find("#sic-type");
    //typeList.prop("selectedIndex", (prefix == "ae") ? 1 : 2);
    //get the data
    var sicData = new SicData(type);
    //data.type = type;
    //data.entries = [];
    var rowId = id.replace("e", "r");     
    var row = $("#" + rowId);
    var name = row.find("span.sic")
    var longName = name.text();
    var dataElement = row.find("span.sic-data");
    var text = dataElement.text();
    var data = eval(dataElement.text());
    //var template = $("#sic-entry-template");
    for(var i = 0; i < data.length; i++) {
        if (i > 25)
            throw new Error("too many entries");
        var entry = new Entry(data[i][0], data[i][1], longName.substr(data[i][2], data[i][3]));
        sicData.AddChild(entry);

    }
    return sicData;
}

        //populateSic(id, sicPopupNew, sicList, ids[0]);
        
function sicPopulate(sicPopup, data) {
    var typeList =sicPopup.find("#sic-type");
    typeList.prop("selectedIndex", data.Type);
    //get the data
    var template = $("#sic-entry-template");
    for(var i = 0; i < data.Children.length; i++) {
        var entry = createEntry(template, data.Children[i], i);
        sicPopup.list.append(entry);
    }
}

function sicDisplay(id, onSave) {
    var ids = id.split('_');
    if (!(ids[0]== "ae" || ids[0]== "ie" || ids[0]== "aa"))
         throw new Error("unknown popup action");
    //data = [{'privacy': 1, 'search': 2, 'name' :'cccccc'},{'privacy': 1, 'search': 2, 'name' :'cccccc'}];

    var sicPopup = $("#sic-popup");
    var sicPopupNew = sicPopup.clone(true);
    sicPopupNew.attr("id", "sic-popup-new");
    var sicList =  sicPopupNew.find("#sic-list");
    sicList.attr("id", "sic-list-new");

    sicList.css("background-color", "red");
    sicList.attr("origin", id);
    var template = $("#sic-entry-template");

    //(Privacy marking = CCCCC or Privacy marking = DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
    clickRebind(sicPopupNew, ".btn-plus", addEntry);
    clickRebind(sicPopupNew, "#popup-sic-save", onSave);
    sicPopupNew.css("display", "inline");
    $("body").append(sicPopupNew);
    //
    sicPopupNew.list = sicList;
    return sicPopupNew;

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
        alert("set" + this.id);
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
