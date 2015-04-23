//http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA

$(function(){
	$.ajax({
		url:'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA',
		type: 'get',
		dataType: 'xml'
	}).done(function(response){
		console.log('success');
		console.log(response);
		debugger;
	}).fail(function(err){
		console.log('error');
	})
});

// (function(){
// 	var zillowReq = function(){
// 		var xhr = new XMLHttpRequest();
// 		xhr.open('GET', 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA');
// 		xhr.onload = function() {
// 			console.log(xhr.responseText);
// 		  var zillowRes = xmlToJson(xhr.responseText);
// 		  debugger;
// 		}
// 		xhr.send();
// 	}
//   zillowReq();
  
// })();