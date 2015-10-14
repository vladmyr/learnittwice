//"use strict";
//
//var $ = require("jquery");
//var _ = require("underscore");
//var datatables = require("datatables");
//
//var Base = require("../base");
//
//$.fn.DataTable = datatables; //ToDo: implement browserify-shim
//
//var List = function(){
//  var that = new Base();
//
//  var _getDataTableColumns = function(){
//    var index = 1;
//
//    return [{
//      render: function(){
//        return index++;
//      }
//    }, {
//      name: "id",
//      data: "id"
//    }, {
//      name: "lemma",
//      data: "lemma"
//    }]
//  };
//
//  that.data = _.extend(that.data, {
//    url: {
//      dataTable: "/dictionary/list.json"
//    }
//  });
//
//  that.ui = _.extend(that.ui, {
//    dataTable: $("#data-table")
//  });
//
//  that.initDataTable = function(){
//    that.dataTableObject = that.ui.dataTable.DataTable(_.extend(that.data.dataTable.options, {
//      ajax: {
//        url: that.data.url.dataTable,
//        data: function(data){
//
//        }
//      },
//      columns: _getDataTableColumns()
//    }));
//
//    return that;
//  };
//
//  that.init = function(){
//    that.system.log("dictionary/list.init()");
//
//    return that
//      .initDataTable();
//  };
//
//  return that.init();
//};
//
//$(function(){
//  return new List();
//});