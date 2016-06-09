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

function parseFilterExpressions(projects) {
	
	for (let project of projects) { // 'for i of var' iterates the values, for .. in .. iterates the keys instead (ECMA 2015) https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Statements/for...of#Browser_compatibility 
//	   console.log(project); 
	   for (let mapping of project.mappings) {
//		   console.log(mapping);
		   for (let iap of mapping.input_attribute_paths) {
//			   console.log(iap);
			   if (iap.filter!=null && iap.filter.expression!=null) {
//				   console.log(iap.filter.expression);
				   var parsedFilterExpression = jQuery.parseJSON(iap.filter.expression);
//				   console.log(parsedFilterExpression);
				   iap.filter.expression=parsedFilterExpression;
//				   console.log(iap.filter.expression);
			   }
		   }
	   }
		   
		}
	return projects;
}


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
    	  if (imapi.filter!=null && imapi.filter.expression!=null) {
    		  expressionString = imapi.filter.expression;
    		  expression = jQuery.parseJSON(expressionString);
    	  }
    	  return expression;
      },
       
       getAbbreviatedPath: function(path) {
		   if (path==null || path=="") {
			   return "";
		   } else {
			   var pathElements = path.split('\u001E');
			   var abbrevPathElements = [];
			   for (let element of pathElements) {
				   if (element.indexOf("#")+1!=-1) {
					   abbrevPathElements.push(element.substr(element.lastIndexOf("#")+1,element.length));
				   }
			   }
			   return abbrevPathElements.join("/");
		   }
       }

    };
  })
  .controller('ProjectsCtrl', function($scope, $http, MappingTable, ApiEndpoint){
	// TODO use ProjectsResource or even reuse project list from overview page
    $http.get(ApiEndpoint + 'projects?format=medium').then(function(response) {
      $scope.projects = parseFilterExpressions(response.data);
      $scope.mappingTable = MappingTable;
    });
  })
  .controller('MappingTableCtrl', function($scope, MappingTable){
    $scope.mappingTable = MappingTable;
  })
  ;
