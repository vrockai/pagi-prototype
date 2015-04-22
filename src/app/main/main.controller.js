'use strict';
var mod = angular.module('pagiPrototype');

mod.controller('MainCtrl', function ($scope, $resource, linkHeaderParser) {

  $scope.offset = 0;
  $scope.perPage = 10;
  $scope.maxPages = 5;
  $scope.paginationPages = [];

  function setScopeResouces(data, headers){
    console.log(data, headers);
    $scope.data = data;
    $scope.links = linkHeaderParser.parseLink(headers().link);
    console.log('links', $scope.links);
    $scope.headers = headers();
    $scope.total = headers()['x-total-count'];
  }

  $scope.pageChanged = function(){
    console.log('current page ', $scope.currentPage);
    $scope.goTo($scope.currentPage);
  };

  function renderPaginationPages() {
    var pages = $scope.total / $scope.perPage;

    $scope.paginationPages = [];

    for (var i = 0; i < $scope.maxPages; i++){

    }
  }

  $resource('http://localhost:8080/api/data?page=0&per_page='+$scope.perPage).query({}, setScopeResouces);

  $scope.goTo = function(pageNumber) {
    $resource('http://localhost:8080/api/data?page=' + (pageNumber-1) + '&per_page='+$scope.perPage).query(
      {},
      setScopeResouces
    );
  };

  $scope.prev = function(){
    if ($scope.links.rels.prev) {
      console.log('going prev', $scope.links.rels.prev);
      $resource($scope.links.rels.prev.href).query({}, setScopeResouces);
    } else {
      console.log('no prev link');
    }
  };

  $scope.next = function(){
    if ($scope.links.rels.next) {
      console.log('going next', $scope.links.rels.next);
      $resource($scope.links.rels.next.href).query({}, setScopeResouces);
    } else {
      console.log('no next link');
    }
  };

});

mod.factory('hkPagination', function(){
  return {};
});

mod.factory('linkHeaderParser', function(){
  var linkexp=/<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
  var paramexp=/[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

  function unquote(value)
  {
    if (value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') return value.substring(1, value.length - 1);
    return value;
  }

  function parseLinkHeader(value)
  {
    var matches = value.match(linkexp);
    var rels = new Object();
    var titles = new Object();
    for (var i = 0; i < matches.length; i++)
    {
      var split = matches[i].split('>');
      var href = split[0].substring(1);
      var ps = split[1];
      var link = new Object();
      link.href = href;
      var s = ps.match(paramexp);
      for (var j = 0; j < s.length; j++)
      {
        var p = s[j];
        var paramsplit = p.split('=');
        var name = paramsplit[0];
        link[name] = unquote(paramsplit[1]);
      }

      if (link.rel != undefined)
      {
        rels[link.rel] = link;
      }
      if (link.title != undefined)
      {
        titles[link.title] = link;
      }
    }
    var linkheader = new Object();
    linkheader.rels = rels;
    linkheader.titles = titles;
    return linkheader;
  }

  return {
    parseLink: parseLinkHeader
  }
});
