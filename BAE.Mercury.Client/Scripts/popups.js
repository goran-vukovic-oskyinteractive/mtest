//jquery plugin
(function ($) {
    $.fn.popUpBox = function () {
        var box = $(this);
        if (!box.length)
            throw new Error("popup html not found");
        var popupMsg = box.find(".popup-msg");
        if (!popupMsg.length)
            throw new Error("popup message not found");
        box.okBtn = box.find(".answer-ok");
        if (!box.okBtn.length)
            throw new Error("popup ok button not found");
        var closeDialog = function () {
            box.dialog("close");
            return false;
        }

        box.okBtn.click(closeDialog);
        var dialog = box.dialog({
            modal: true,
            close: function (event, ui) {
                //alert("default close");
                box.okBtn.off('click');
                popupMsg.html("");
            }
        });
        //set focus on Ok
        box.okBtn.focus();
        this.each(function () {
            // for compatibility
        });
        var openDialog = function () {
            box.dialog("open");
        }
        var staticTextSet = function (title, message) {
            box.dialog({ title: title });
            popupMsg.html(message);
        }
        this.showAlert = function (title, message) {
            staticTextSet(title, message);
            openDialog();
        }

        var cancelBtnSet = function () {

            box.cancelBtn = box.find(".answer-cancel");
            if (!box.cancelBtn.length)
                throw new Error("popup cancel button not found");
            box.cancelBtn.click(closeDialog);
        }

        this.showConfirm = function (title, message, action) {
            staticTextSet(title, message);
            box.okBtn.off("click");
            box.okBtn.click(function () {
                action();
                closeDialog();
            });
            cancelBtnSet();
            box.defaultClose = box.dialog("option", "close");
            box.dialog({ close: function () {
                box.cancelBtn.off('click');
                box.defaultClose.call();
            }
            });
            openDialog();
        }
        this.showPrompt = function (title, message, action, text) {
            staticTextSet(title, message);
            box.input = box.find(".dm-input-box");
            box.input.bind('keydown', function (e) {
                if (e.keyCode == 13) {
                    onSubmit();
                }
            });
            if (!box.input.length)
                throw new Error("popup input control not found");
            if (text)
                box.input.val(text);
            box.okBtn.off("click");
            var onSubmit = function () {
                var val = box.input.attr("value").trim();
                if (val.length <= 0) {
                    var popUp = $("#dm-alert").popUpBox();
                    popUp.showAlert(title, "Please enter information in the highlighted field");
                    highlightControl(input);
                    return false;
                } else {
                    action(val);
                    closeDialog();
                    return false;
                }
            }
            box.okBtn.click(onSubmit);
            cancelBtnSet();

            box.defaultClose = box.dialog("option", "close");
            box.dialog({ close: function () {

                //alert("custom close");
                box.cancelBtn.off('click');
                if (box.input) {
                    box.input.val("");
                    box.input.off("keydown");
                }
                box.defaultClose.call();
            }
            });
            openDialog();
            box.input.focus();
            box.input.select();


        }
        return this;
    };
})(jQuery);

