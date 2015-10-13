/**
 * Copyright (C) 2013 – 2015  SLUB Dresden & Avantgarde Labs GmbH (<code@dswarm.org>)
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

angular.module('dmpApp')
    .controller('SelectRecordsCtrl', function($scope, $http, $q, $modal, $modalInstance, loDash, gdmParser, schemaParser, filterHelper, PubSub, DataModelResource, project) {

        $scope.internalName = 'Selected Records Widget';

        $scope.activeFilterObject = project;
        $scope.filters = [];

        $scope.dataSources = [];
        $scope.dataSchema = angular.copy(project.input_data_model.schema);
        $scope.dataLoaded = false;
        $scope.isRemoveFilter = false;
        $scope.filterSelectorShown = false;

        var rawDataSources = project._$selectedRecords;
        var inputDataModel = project.input_data_model;
        $scope.model = {
            selectedRecords: rawDataSources,
            inputDataModel: inputDataModel
        };
        var inputFilterCollection = [];

        // deactivated until further notice
        /* jshint ignore:start */
        function restrictSchema(schema, pathId) {
            var exactPath = loDash.find(schema.attribute_paths, { uuid: pathId });

            if (angular.isDefined(exactPath)) {
                var exactAttributes = exactPath.attributes;

                schema.attribute_paths = loDash.filter(schema.attribute_paths, function(ap) {

                    return loDash.every(exactAttributes, function(a, i) {

                        return ap.attributes[i] && ap.attributes[i].uuid === a.uuid;
                    });
                });
            }
        }
        /* jshint ignore:end */

        $scope.expandCollapse = function(that, data) {

            data.$wasRendered = true;
            data.$show = !data.$show;
        };

        $scope.wasRendered = function(data) {
            return data.$wasRendered;
        };

        $scope.isCollapsed = function(data) {
            return !data.$show;
        };

        $scope.update = function() {

            // just update input filter collection here (that can be utilised for search later)
            inputFilterCollection = filterHelper.buildFilterInputs($scope.filters);

            return true;
        };

        $scope.addFilter = function() {

            var inFilterTree = false;
            var editableTitle = true;
            var filter = schemaParser.fromDomainSchema($scope.dataSchema, editableTitle, inFilterTree);

            $scope.filterSelectorShown = true;

            $scope.filters.push({
                filter: filter,
                inputFilters: [],
                name: 'new filter'
            });
        };

        var processRecords = function(args) {

            if (args.records) {

                var schema = $scope.dataSchema;

                if (args.schema) {

                    schema = angular.copy(args.schema);
                }
                // deactivated until further notice
//                if (attributePathId) {
//                    restrictSchema(schema, attributePathId);
//                }

                schema.name = schema.name || '';

                rawDataSources = args.records;
                $scope.dataSources = loDash.map(args.records, function(record) {

                        return gdmParser.parse(record.data, schema);
                    }
                );

                $scope.dataSchema = schema;

                $scope.update();

                $scope.dataLoaded = true;
            }
        };

        $scope.searchRecords = function() {

            var filters2 = filterHelper.prepareFilters($scope.filters, $scope.activeFilterObject);

            if(!filters2) {

                // TODO: maybe give user a hint, that the filter couldn't match anything (which should be never the case ;) )

                return false;
            }

            var filterAP = filters2[0][0];
            var filterValue = filters2[0][1];

            var payload = {
                key_attribute_path: filterAP,
                search_value: filterValue
            };

            DataModelResource.searchRecords({
                id: inputDataModel.uuid,
                atMost: 3
                },
                payload,
                function(dataResult) {

                    var request = {
                        records: dataResult,
                        schema: inputDataModel.schema
                    };

                    var message = {
                        records: dataResult,
                        dataModel: inputDataModel
                    };

                    PubSub.broadcast('updateRecordsData', message);

                    processRecords(request);
                });
        };

        // TODO: enable in UI?
        $scope.close = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.save = function() {

            var result = {
                removeFilter: $scope.isRemoveFilter,
                selectedRecords: rawDataSources
            };

            $modalInstance.close(result);
        };

        $scope.removeFilter = function() {

            var modalInstance = $modal.open({
                templateUrl: 'views/controllers/confirm-remove-record-selection.html'
            });

            modalInstance.result.then(function() {

                rawDataSources = [];
                $scope.filters = [];
                $scope.model = {};
                $scope.isRemoveFilter = true;
                $scope.filterSelectorShown = false;

                $scope.update();
            });
        };

        PubSub.ask($scope, 'getLoadData', {}, 'returnFullLoadData', processRecords);
    });
