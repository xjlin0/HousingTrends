//http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz1a9jqja8op7_1u0pu&address=1926+M+L+KING+JR+Way&citystatezip=Oakland%2C+CA

// $(function(){
// 	var address = '1926 M L KING JR Way, Oakland, CA' 
// 	$.ajax({
// 		url:'/heatmaps/proxy',
// 		data:{address:address}
// 	}).done(function(serverData){
// 		console.log('success');
// 		console.log(serverData);
// 	}).fail(function(err){
// 		console.log('error');
// 	})
// });

// function callback_func(response){
// 	console.log(response);
// }

(function(){
	var address = '1926 M L KING JR Way, Oakland, CA'; 
	var zillowReq = function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/heatmaps/proxy');
		// xhr.onload = function() {
		// 	console.log(xhr.responseText);
		// }
		xhr.send(address);
	}
  zillowReq();
})();

