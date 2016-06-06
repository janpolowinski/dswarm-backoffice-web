/**
 * Copyright (C) 2013 – 2016  SLUB Dresden & Avantgarde Labs GmbH (<code@dswarm.org>)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var baseUrlBackend = 'http://194.95.142.135/dmp/';



angular.module('dmpApp')
  .factory('MappingTable', function() {
    var project = null;
    return {
    	
      getMappings: function() {
    	if(project!=null)
    		return project.mappings;
    	else
    		return [];
      },
      
      setProject: function(currentProject) {
        project = currentProject;
      },
      
      getProject: function() {
          return project;
      },
      
      getFilterExpression: function(imapi) {
    	  var expressionString;
    	  var expression = null;
    	  if(imapi.filter==null) 
    		  return null;
    	  else if (imapi.filter.expression!=null) {
    		  expressionString = imapi.filter.expression;
//    		  expression = {"type" : "test", "expression" : "expression"};
    		  expression = jQuery.parseJSON(expressionString);
//    		  alert(expression.type);
    	  }
    	  return expression;
      },

      getTagValueFromFilter: function(expressionString) {
    		if (null!=expressionString) {
    		    var re = /^.*#tag":"([^"]*)"\}.*/; 
    		    var matches = expressionString.match(re);
    	        if (matches == null) return "";
    	        else return matches[1];
    		} else return "";
       },
    	
       getCodeValueFromFilter: function (expressionString) {
    		if (null!=expressionString) {
    		    var re = /^.*#code":"([^"]*)"\}.*/; 
    		    var matches = expressionString.match(re);
    	        if (matches == null) return "";
    	        else return matches[1];
    		} else return "";
    	},

    	getIDValueFromFilter: function (expressionString) {
    		if (null!=expressionString) {
    		    var re = /^.*#id":"([^"]*)"\}.*/; 
    		    var matches = expressionString.match(re);
    	        if (matches != null) return " !!!!!!!!!!!!! ID was used somewhere in Filter! Intentionally? !!!!!!!!!!!!!!!!";
    	        else return "";
    		} else return "";
    	}

    };
  })
  .controller('ProjectsCtrl', function($scope, $http, MappingTable, ApiEndpoint){
	// TODO use ProjectsResource or even reuse project list from overview page
    $http.get(ApiEndpoint + 'projects?format=medium').then(function(response) {

      $scope.projects = response.data;
      $scope.mappingTable = MappingTable;
    });
  })
  .controller('MappingTableCtrl', function($scope, MappingTable){
    $scope.mappingTable = MappingTable;
  })
  ;
