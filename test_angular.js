/**
 * Created by kojima37 on 7/30/15.
 */

var module = angular.module('myApp',[]);
module.directive('viewDirective', function(){
    return {
        template: '<h1>HokkaidoMapView</h1>'
    };
});