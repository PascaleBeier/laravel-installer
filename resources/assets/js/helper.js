(function($) {
    'use strict';
    $.easyAjax = function(options) {
        var defaults = {
            type: 'GET',
            container: 'body',
            blockUI: true,
            disableButton: false,
            buttonSelector: "[type='submit']",
            dataType: "json",
            messagePosition: "toastr",
            errorPosition: "field",
            hideElements: false,
            redirect: true,
            data: {},
            file: false
        };

        var opt = defaults;

        // Extend user-set options over defaults
        if (options) {
            opt = $.extend(defaults, options);
        }

        // Methods if not given in option
        if (typeof opt.beforeSend != "function") {
            opt.beforeSend = function() {
                // Hide previous errors
                $(opt.container).find(".has-error").each(function () {
                    $(this).find(".help-block").text("");
                    $(this).removeClass("has-error");
                });

                $(opt.container).find("#alert").html("");

                if (opt.blockUI) {
                    $.easyBlockUI(opt.container);
                }

                if (opt.disableButton) {
                    loadingButton(opt.buttonSelector);
                }
            }
        }

        if (typeof opt.complete != "function") {
            opt.complete = function (jqXHR, textStatus) {
                if (opt.blockUI) {
                    $.easyUnblockUI(opt.container);
                }

                if (opt.disableButton) {
                    unloadingButton(opt.buttonSelector)
                }
            }
        }

        // Default error handler
        if (typeof opt.error != "function") {
            opt.error = function(jqXHR, textStatus, errorThrown) {
                try {
                    var response = JSON.parse(jqXHR.responseText);
                    if (typeof response == "object") {
                        handleFail(response);
                    }
                    else {
                        var msg = "A server side error occurred. Please try again after sometime.";

                        if (textStatus == "timeout") {
                            msg = "Connection timed out! Please check your internet connection";
                        }
                        showResponseMessage(msg, "error");
                    }
                }
                catch (e) {

                }
            }
        }

        function showResponseMessage(msg, type, toastrOptions) {
            var typeClasses = {
                "error": "danger",
                "success": "success",
                "primary": "primary",
                "warning": "warning",
                "info": "info"
            };

            if (opt.messagePosition == "toastr") {
                $.showToastr(msg, type, toastrOptions);
            }
            else {
                var ele = $(opt.container).find("#alert");
                var html = '<div class="alert alert-'+ typeClasses[type] +'">' + msg +'</div>';
                if (ele.length == 0) {
                    $(opt.container).find(".form-group:first")
                        .before('<div id="alert">' + html + "</div>");
                }
                else {
                    ele.html(html);
                }
            }
        }

        // Execute ajax request

        if (opt.file == true) {
            var data = new FormData($(opt.container)[0]);
            var keys = Object.keys(opt.data);

            for(var i=0; i<keys.length;i++) {
                data.append(keys[i], opt.data[keys[i]]);
            }

            opt.data = data;
        }

        $.ajax({
            type: opt.type,
            url: opt.url,
            dataType: opt.dataType,
            data: opt.data,
            beforeSend: opt.beforeSend,
            contentType: (opt.file)?false:"application/x-www-form-urlencoded; charset=UTF-8",
            processData : !opt.file,
            error: opt.error,
            complete: opt.complete,
            success: function (response) {
                // Show success message
                if (response.status == "success") {
                    if (response.action == "redirect") {
                        if (opt.redirect) {
                            var message = "";
                            if (typeof response.message != "undefined") {
                                message += response.message;
                            }
                            message += " Redirecting...";

                            showResponseMessage(message, "success", {
                                timeOut: 100000,
                                positionClass: "toast-top-right"
                            });
                            window.location.href = response.url;
                        }
                    }
                    else {
                        if (typeof response.message != "undefined") {
                            showResponseMessage(response.message, "success");
                        }
                    }

                    if (opt.removeElements == true) {
                        $(opt.container).find(".form-group, button, input").remove();
                    }
                }

                if (response.status == "fail") {
                    handleFail(response);
                }

                if (typeof opt.success == "function") {
                    opt.success(response);
                }
            }
        });

        function handleFail(response) {
            if (typeof response.message != "undefined") {
                showResponseMessage(response.message, "error");
            }

            if (typeof response.errors != "undefined") {
                var keys = Object.keys(response.errors);

                $(opt.container).find(".has-error").find(".help-block").remove();
                $(opt.container).find(".has-error").removeClass("has-error");

                if (opt.errorPosition == "field") {
                    for (var i = 0; i < keys.length; i++) {
                        // Escape dot that comes with error in array fields
                        var key = keys[i].replace(".", '\\.');
                        var formarray = keys[i];
                        // If the response has form array
                        if(formarray.indexOf('.') >0){
                            var array = formarray.split('.');
                            response.errors[keys[i]] = response.errors[keys[i]];
                            key = array[0]+'['+array[1]+']';
                        }

                        var ele = $(opt.container).find("[name='" + key + "']");

                        // If cannot find by name, then find by id
                        if (ele.length == 0) {
                            ele = $(opt.container).find("#" + key);
                        }

                        var grp = ele.closest(".form-group");
                        $(grp).find(".help-block").remove();
                        var helpBlockContainer = $(grp).find("div:first");
                        if($(ele).is(':radio')){
                            helpBlockContainer = $(grp).find("div:eq(2)");
                        }

                        if (helpBlockContainer.length == 0) {
                            helpBlockContainer = $(grp);
                        }

                        helpBlockContainer.append('<div class="help-block">' + response.errors[keys[i]] + '</div>');
                        $(grp).addClass("has-error");
                    }

                    if (keys.length > 0) {
                        var element = $("[name='" + keys[0] + "']");
                        if (element.length > 0) {
                            $("html, body").animate({scrollTop: element.offset().top - 150}, 200);
                        }
                    }
                }
                else {
                    var errorMsg = "<ul>";
                    for (var i = 0; i < keys.length; i++) {
                        errorMsg += "<li>" + response.errors[keys[i]] + "</li>";
                    }
                    errorMsg += "</ul>";

                    var errorElement = $(opt.container).find("#alert");
                    var html = '<div class="alert alert-danger">' + errorMsg +'</div>';
                    if (errorElement.length == 0) {
                        $(opt.container).find(".form-group:first")
                            .before('<div id="alert">' + html + "</div>");
                    }
                    else {
                        errorElement.html(html);
                    }
                }
            }
        }

        function loadingButton(selector) {
            var button = $(opt.container).find(selector);

            var text = "Submitting...";

            if (button.width() < 20) {
                text = "...";
            }

            if (!button.is("input")) {
                button.attr("data-prev-text", button.html());
                button.text(text);
                button.prop("disabled", true);
            }
            else {
                button.attr("data-prev-text", button.val());
                button.val(text);
                button.prop("disabled", true);
            }
        }

        function unloadingButton(selector) {
            var button = $(opt.container).find(selector);

            if (!button.is("input")) {
                button.html(button.attr("data-prev-text"));
                button.prop("disabled", false);
            }
            else {
                button.val(button.attr("data-prev-text"));
                button.prop("disabled", false);
            }
        }
    };

    $.easyBlockUI = function (container, message) {
        if (message == undefined) {
            message = "Loading...";
        }

        var html = '<div class="loading-message"><div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>';


        if (container != undefined) { // element blocking
            var el = $(container);
            var centerY = false;
            if (el.height() <= ($(window).height())) {
                centerY = true;
            }
            el.block({
                message: html,
                baseZ: 999999,
                centerY: centerY,
                css: {
                    top: '10%',
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: 'transparent',
                    opacity: 0.05,
                    cursor: 'wait'
                }
            });
        } else { // page blocking
            $.blockUI({
                message: html,
                baseZ: 999999,
                css: {
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: '#555',
                    opacity: 0.05,
                    cursor: 'wait'
                }
            });
        }
    };

    $.easyUnblockUI = function (container) {
        if (container == undefined) {
            $.unblockUI();
        }
        else {
            $(container).unblock({
                onUnblock: function () {
                    $(container).css('position', '');
                    $(container).css('zoom', '');
                }
            });
        }
    };

    $.showToastr = function(toastrMessage, toastrType, options) {

        var defaults = {
            "closeButton": false,
            "debug": false,
            "positionClass": "toast-top-right",
            "onclick": null,
            "showDuration": "1000",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };

        var opt = defaults;

        if (typeof options == "object") {
            opt = $.extend(defaults, options);
        }

        toastr.options = opt;

        toastrType = typeof toastrType !== 'undefined' ? toastrType : 'success';

        toastr[toastrType](toastrMessage);
    };

    $.ajaxModal = function(selector, url, onLoad) {
        $(selector).removeData('bs.modal').modal({
            remote: url,
            show: true
        });

        // Trigger to do stuff with form loaded in modal
        $(document).trigger("ajaxPageLoad");

        // Call onload method if it was passed in function call
        if (typeof onLoad != "undefined") {
            onLoad();
        }

        // Reset modal when it hides
        $(selector).on('hidden.bs.modal', function () {
            $(this).find('.modal-body').html('Loading...');
            $(this).find('.modal-footer').html('<button type="button" data-dismiss="modal" class="btn dark btn-outline">Cancel</button>');
            $(this).data('bs.modal', null);
        });
    };

    $.showErrors = function(object) {
        var keys = Object.keys(object);

        $(".has-error").find(".help-block").remove();
        $(".has-error").removeClass("has-error");

        for (var i = 0; i < keys.length; i++) {
            var ele = $("[name='" + keys[i] + "']");
            if (ele.length == 0) {
                ele = $("#" + keys[i]);
            }
            var grp = ele.closest(".form-group");
            $(grp).find(".help-block").remove();
            var helpBlockContainer = $(grp).find("div:first");

            if (helpBlockContainer.length == 0) {
                helpBlockContainer = $(grp);
            }

            helpBlockContainer.append('<div class="help-block">' + object[keys[i]] + '</div>');
            $(grp).addClass("has-error");
        }
    }
})(jQuery);

// Prevent submit of ajax form
$(document).on("ready", function() {
    $(".ajax-form").on("submit", function(e){
        e.preventDefault();
    })
});
$(document).on("ajaxPageLoad", function() {
    $(".ajax-form").on("submit", function(e){
        e.preventDefault();
    })
});