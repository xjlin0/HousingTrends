//http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA

$(function(){
	var address = '1926 M L KING JR Way, Oakland, CA' 
	$.ajax({
		url:'/heatmaps/proxy',
		data:{address:address}
	}).done(function(serverData){
		console.log('success');
		console.log(serverData);
	}).fail(function(err){
		console.log('error');
	})
});

// function callback_func(response){
// 	console.log(response);
// }

// (function(){
// 	var zillowReq = function(){
// 		var xhr = new XMLHttpRequest();
// 		xhr.open('GET', 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA?callback=callback_func');
// 		xhr.onload = function() {
// 			console.log(xhr.responseText);
// 		  var zillowRes = xmlToJson(xhr.responseText);
// 		  debugger;
// 		}
// 		xhr.send();
// 	}
//   zillowReq();
  
// })();
