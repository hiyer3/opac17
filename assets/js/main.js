"use strict";

var numberPerColumn = 8; //how many bars are on each slide for states/specialities
var secondsPerSlide = 10; //how long in seconds each slide is visible

//These are some functions, jQuery additions, prototypes, polyfills, etc. that I use all the time.

//support for location.origin in < IE 11
if (!window.location.origin) {
  window.location.origin =
    window.location.protocol +
    "//" +
    window.location.hostname +
    (window.location.port ? ":" + window.location.port : "");
}

var getUrlVars =
  getUrlVars ||
  function () {
    var vars = {};
    var parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function (m, key, value) {
        vars[key] = value;
      }
    );
    return vars;
  };

var getOrdinal = function getOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

//jQuery additions
//Deserializes query strings
(function ($) {
  $.deserialize = function (query, options) {
    if (query == "") return null;
    var hash = {};
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var k = decodeURIComponent(pair[0]);
      var isArray = false;
      if (k.substr(k.length - 2) == "[]") {
        isArray = true;
        k = k.substring(0, k.length - 2);
      }
      var v = decodeURIComponent(pair[1]);
      // If it is the first entry with this name
      if (typeof hash[k] === "undefined") {
        if (isArray)
          // not end with []. cannot use negative index as IE doesn't understand it
          hash[k] = [v];
        else hash[k] = v;
        // If subsequent entry with this name and not array
      } else if (typeof hash[k] === "string") {
        hash[k] = v; // replace it
        // If subsequent entry with this name and is array
      } else {
        hash[k].push(v);
      }
    }
    return hash;
  };
  $.fn.deserialize = function (options) {
    return $.deserialize($(this).serialize(), options);
  };
})(jQuery);

//Add $.put and $.delete functions
(function ($) {
  jQuery.each(["put", "delete"], function (i, method) {
    jQuery[method] = function (url, data, callback, type) {
      if (jQuery.isFunction(data)) {
        type = type || callback;
        callback = data;
        data = undefined;
      }

      return jQuery.ajax({
        url: url,
        type: method,
        dataType: type,
        data: data,
        success: callback,
      });
    };
  });
})(jQuery);

//Prototypes

//validation function
String.prototype.validateAs =
  String.prototype.validateAs ||
  function (type) {
    var re;
    if (!type) {
      return false;
    }
    if (type == "email") {
      //from jquery validate plugin
      re =
        /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    } else if (type == "mongoid" || type == "objectid") {
      //24 digit hexadecimal
      re = /^[0-9a-fA-F]{24}$/;
    } else if (type == "required") {
      re = /\S/;
    } else if (type == "integer") {
      re = /^\s*(\+|-)?\d+\s*$/;
    } else if (type == "url" || type == "FQDN") {
      //from jquery validate plugin
      re =
        /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    } else if (type == "link") {
      re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    } else if (type == "date") {
      return !/Invalid|NaN/.test(new Date(this));
    } else if (type == "domain") {
      re = /^[a-z0-9]+[a-z0-9-\.]*[a-z0-9]+\.[a-z\.]{2,5}$/;
    } else if (type == "number" || type == "numeric") {
      re = /^-?\d+\.?\d*$/;
    } else if (type == "alphanumeric") {
      re = /^[a-z0-9]+$/i;
    } else if (type == "binary") {
      re = /^[01]+$/;
    } else if (type == "hexadecimal") {
      re = /^[a-f0-9]+$/i;
    } else if (type == "creditcard") {
      re =
        /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
    } else {
      return false;
    }
    return re.test(this);
  };

//various string functions
String.prototype.toTitleCase =
  String.prototype.toTitleCase ||
  function () {
    return this.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

String.prototype.trim =
  String.prototype.trim ||
  function () {
    return this.replace(/^\s+|\s+$/, "");
  };

String.prototype.nl2br =
  String.prototype.nl2br ||
  function () {
    return this.replace(/(\r\n|\r|\n)/g, "<br />");
  };
String.prototype.br2nl =
  String.prototype.br2nl ||
  function () {
    return this.replace(/<br \/>|<br\/>/g, "\n");
  };
String.prototype.stripTags =
  String.prototype.stripTags ||
  function () {
    return this.replace(/<\S[^>]*>/g, "");
  };
var statesNamesAndAbbreviations = [
  { name: "Alabama", abbrev: "AL" },
  { name: "Alaska", abbrev: "AK" },
  { name: "Arizona", abbrev: "AZ" },
  { name: "Arkansas", abbrev: "AR" },
  { name: "California", abbrev: "CA" },
  { name: "Colorado", abbrev: "CO" },
  { name: "Connecticut", abbrev: "CT" },
  { name: "Delaware", abbrev: "DE" },
  { name: "District of Columbia", abbrev: "DC" },
  { name: "Florida", abbrev: "FL" },
  { name: "Georgia", abbrev: "GA" },
  { name: "Hawaii", abbrev: "HI" },
  { name: "Idaho", abbrev: "ID" },
  { name: "Illinois", abbrev: "IL" },
  { name: "Indiana", abbrev: "IN" },
  { name: "Iowa", abbrev: "IA" },
  { name: "Kansas", abbrev: "KS" },
  { name: "Kentucky", abbrev: "KY" },
  { name: "Louisiana", abbrev: "LA" },
  { name: "Maine", abbrev: "ME" },
  { name: "Maryland", abbrev: "MD" },
  { name: "Massachusetts", abbrev: "MA" },
  { name: "Michigan", abbrev: "MI" },
  { name: "Minnesota", abbrev: "MN" },
  { name: "Mississippi", abbrev: "MS" },
  { name: "Missouri", abbrev: "MO" },
  { name: "Montana", abbrev: "MT" },
  { name: "Nebraska", abbrev: "NE" },
  { name: "Nevada", abbrev: "NV" },
  { name: "New Hampshire", abbrev: "NH" },
  { name: "New Jersey", abbrev: "NJ" },
  { name: "New Mexico", abbrev: "NM" },
  { name: "New York", abbrev: "NY" },
  { name: "North Carolina", abbrev: "NC" },
  { name: "North Dakota", abbrev: "ND" },
  { name: "Ohio", abbrev: "OH" },
  { name: "Oklahoma", abbrev: "OK" },
  { name: "Oregon", abbrev: "OR" },
  { name: "Pennsylvania", abbrev: "PA" },
  { name: "Rhode Island", abbrev: "RI" },
  { name: "South Carolina", abbrev: "SC" },
  { name: "South Dakota", abbrev: "SD" },
  { name: "Tennessee", abbrev: "TN" },
  { name: "Texas", abbrev: "TX" },
  { name: "Utah", abbrev: "UT" },
  { name: "Vermont", abbrev: "VT" },
  { name: "Virginia", abbrev: "VA" },
  { name: "Washington", abbrev: "WA" },
  { name: "West Virginia", abbrev: "WV" },
  { name: "Wisconsin", abbrev: "WI" },
  { name: "Wyoming", abbrev: "WY" },
  { name: "Military", abbrev: "MIL" },
  { name: "Hawaii", abbrev: "HA" },
];
function getStateName(abbr) {
  if (typeof abbr === "undefined" || !abbr) {
    return false;
  } else {
    var name;
    statesNamesAndAbbreviations.forEach(function (st) {
      if (st.abbrev.toLowerCase() == abbr.toLowerCase()) {
        name = st.name;
      }
    });
    return name;
  }
}
function getStateAbbr(state) {
  if (typeof state === "undefined" || !state) {
    return false;
  } else {
    var abbr;
    statesNamesAndAbbreviations.forEach(function (st) {
      if (st.name.toLowerCase() == state.toLowerCase()) {
        name = st.abbrev;
      }
    });
    return abbr;
  }
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var updateStates = function updateStates() {
  $.getJSON("https://opac17-9bf6c7ec46d0.herokuapp.com/fetchdata?sheetid=1", function (rawData) {
    var data = rawData;
    var dataRows = [];
    var i = 4;

    _.each(data, function (entry) {
      var newData = {};
      newData.state = entry[0];
      newData.total = parseFloat(entry[3]) || 0;
      var graph = entry[4] != "" ? entry[4] : 1;
      newData.totalFormatted = "$" + numberWithCommas(newData.total || 0);
      newData.colorFlag = graph == 0;
      dataRows.push(newData);
    });

    dataRows = _.sortBy(dataRows, "total").reverse();
    var highNum = _.max(_.map(dataRows, "total")) * 1.5;
    var i = 0;
    var html =
      '<div>\
          <div class="row">\
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 col-lg-offset-0 col-md-offset-0 col-sm-offset-0 col-xs-offset-0">\
              <h1 class="bar-graph-title">Participation by states</h1>\
            </div>\
          </div>\
    ';

    _.each(dataRows, function (row) {
      if (row.state) {
        if (i && i % numberPerColumn === 0) {
          html +=
            '</div><div>\
            <div class="row">\
              <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 col-lg-offset-0 col-md-offset-0 col-sm-offset-0 col-xs-offset-0">\
                <h1 class="bar-graph-title">Participation by states</h1>\
              </div>\
            </div>\
          ';
        }
        var stateName = getStateName(row.state) || "No State";
        html +=
          '\
          <div class="row donation-entry">\
            <div class="col-lg-3 col-md-3 col-sm-4 col-xs-6 name-of-group">' +
          stateName +
          '\
            </div>\
            <div class="col-lg-1 col-md-1 col-sm-1 col-xs-1 state-logo">\
              <img src="assets/images/' +
          stateName.split(" ").join("") +
          '.png" alt="' +
          row.state +
          '" class="img"/>\
            </div>\
            <div class="col-lg-8 col-md-8 col-sm-7 col-xs-4">\
              <div class="elbar hidden-xs ' +
          (row.colorFlag ? "green-bar" : "red-bar") +
          '" data-width="' +
          100 * (row.total / highNum) +
          '%">\
              </div>\
              <div class="formatted-total-wrap">\
                <span class="formatted-total">' +
          row.totalFormatted +
          "</span>\
              </div>\
            </div>\
          </div>\
        ";
        i++;
      }
    });
    html += "</div>";
    $("#bar-graph").append(html);
    $("#bar-graph").slick({
      autoplay: true,
      arrows: false,
      dots: true,
      adaptiveHeight: true,
      autoplaySpeed: secondsPerSlide * 1000,
    });
    $("#bar-graph").on("afterChange", function (event, slick, currentSlide) {
      if (currentSlide + 1 == slick.slideCount) {
        setTimeout(function () {
          location.reload();
        }, secondsPerSlide * 1000 - 1000);
      }
    });

    setTimeout(function () {
      $(".elbar").each(function () {
        var width = $(this).data("width");
        $(this).css({
          width: width,
        });
      });
    }, 400);
  });
};

var updateSpecialty = function updateSpecialty() {
  $.getJSON("https://opac17-9bf6c7ec46d0.herokuapp.com/fetchdata?sheetid=4", function (rawData) {
    var data = rawData;
    var dataRows = [];
    var i = 4;
    _.each(data, function (entry) {
      var newData = {};
      newData.delegation = entry[0];
      newData.total = parseFloat(entry[6]) || 0;
      // newData.title = entry.gsx$title.$t;
      // newData.first = entry.gsx$first.$t;
      // newData.last = entry.gsx$last.$t;
      // newData.suffix = entry.gsx$suffix.$t;
      newData.totalFormatted = "$" + numberWithCommas(newData.total || 0);
      dataRows.push(newData);
    });

    dataRows = _.sortBy(dataRows, "total").reverse();
    var highNum = _.max(_.map(dataRows, "total")) * 1.5;
    var i = 0;
    var html = "<div>";

    _.each(dataRows, function (row) {
      if (row.delegation) {
        if (i && i % numberPerColumn === 0) {
          html += "</div><div>";
        }
        html +=
          '\
          <div class="row donation-entry">\
            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-4 name-of-group">' +
          row.delegation +
          '\
            </div>\
            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-7">\
              <div class="elbar hidden-xs red-bar" data-width="' +
          100 * (row.total / highNum) +
          '%">\
              </div>\
              <div class="formatted-total-wrap">\
                <span class="formatted-total">' +
          row.totalFormatted +
          "</span>\
              </div>\
            </div>\
          </div>\
        ";
        i++;
      }
    });
    html += "</div>";
    $("#bar-graph").append(html);
    $("#bar-graph").slick({
      autoplay: true,
      arrows: false,
      dots: true,
      adaptiveHeight: true,
      autoplaySpeed: secondsPerSlide * 1000,
    });
    $("#bar-graph").on("afterChange", function (event, slick, currentSlide) {
      if (currentSlide + 1 == slick.slideCount) {
        setTimeout(function () {
          location.reload();
        }, secondsPerSlide * 1000 - 1000);
      }
    });

    setTimeout(function () {
      $(".elbar").each(function () {
        var width = $(this).data("width");
        $(this).css({
          width: width,
        });
      });
    }, 400);
  });
};

var updateCircles = function updateCircles() {
  $.getJSON("https://opac17-9bf6c7ec46d0.herokuapp.com/fetchdata?sheetid=3", function (rawData) {
    var data = rawData;
    var dataRows = [];

    var i = 4;

    data = _.sortBy(data, function (entry) {
      return _.get(entry, "2");
    });
    console.log(data);
    _.each(data, function (entry) {
      var circles = [
        "Chairman",
        "McDevitt",
        "Premier",
        "Oliva",
        "Student",
        "Resident",
      ];
      _.each(circles, function (circle) {
        if (entry[6] == circle) {
          var prefix = _.get(entry, "4");
          $("#" + circle + "-Ribbon ul").append(
            "<li>" +
              entry[1] +
              " " +
              entry[2] +
              (prefix && prefix != "" ? " " + prefix : "") +
              "</li>"
          );
        }
      });
    });
    var lists = $("ul");
    lists.each(function () {
      var mylist = $(this);
      var listitems = mylist.children("li").get();
      listitems.sort(function (a, b) {
        var anameparts = $(a).text().trim().split(" ");
        var bnameparts = $(b).text().trim().split(" ");
        anameparts.shift();
        bnameparts.shift();
        var alast = anameparts[0];
        var blast = bnameparts[0];
        return alast
          ? alast.toUpperCase().localeCompare(blast.toUpperCase())
          : null;
      });
      $.each(listitems, function (idx, itm) {
        mylist.append(itm);
      });
      if (listitems.length > 50) {
        mylist.closest("div").css({
          "column-count": "5",
          "font-size": "20px",
        });
        mylist.find("li").css({
          display: "block",
          "white-space": "nowrap",
          "text-overflow": "ellipsis",
          "max-width": "100%",
          overflow: "hidden",
        });
      }
    });
    $("#circles").slick({
      arrows: false,
      autoplay: true,
      dots: true,
      adaptiveHeight: true,
      autoplaySpeed: secondsPerSlide * 1000,
    });
    $("#circles").on("afterChange", function (event, slick, currentSlide) {
      if (currentSlide + 1 == slick.slideCount) {
        setTimeout(function () {
          location.reload();
        }, secondsPerSlide * 1000 - 1000);
      }
    });
  });
};
$(function () {
  var container = $("#main-container");
  if (container.hasClass("page-chart")) {
    updateStates();
  }
  if (container.hasClass("page-circles")) {
    updateCircles();
  }
  if (container.hasClass("page-specialty")) {
    updateSpecialty();
  }
});
