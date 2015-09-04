require('es6-shim');

//to netscape format html
var netscape = require('netscape-bookmarks');

var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'your-tumblr-api-consumer-key'
});
var tumblrSiteUrl = "your-tumblr-site-url";

//Lets require/import the HTTP module
var http = require('http');
var qs = require('querystring');



//Lets define a port we want to listen to
const PORT=8080; 


var tumblrData ="";
//We need a function which handles requests and send response
function handleRequest(request, response){
   	
	var str = request.url.split('?')[1];
	var queryStringObj = qs.parse(str);	
	if(queryStringObj){
		if(queryStringObj.tumblrurl){
			tumblrSiteUrl = queryStringObj.tumblrurl;
		}
	}
    
	callTumblr(function(result){
		
     		response.writeHeader(200, {"Content-Type": "text/html"});  

			
		if (typeof result === 'string' || result instanceof String){
     		response.write("<head><meta charset='UTF-8'/></head>");			
			response.write(result);			
		}else{
			response.write(netscape(result));			
		}

		response.end();
	});
	 
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(process.env.PORT || PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s ",process.env.PORT || PORT);
	console.log("You can specify tumblrurl. e.g http://localhost:%s/?tumblrurl=helloworld.tumblr.com", process.env.PORT || PORT);
});

function callTumblr(_callback){

var result="";
var blogPostCount;

// Make the request
client.posts(tumblrSiteUrl, { type: 'link', limit: 1 }, function (err, data) {
 
  if(err){
	blogPostCount = 0;  
	console.log(err);
	_callback("make sure your tumblr site is correct! You can specify tumblrurl. e.g http://localhost:%s/?tumblrurl=helloworld.tumblr.com");
  }else 
  {
      blogPostCount=	data.total_posts;
    	
      if(blogPostCount ==0){
	_callback("No link posts are found or the tumblr blog does not open for query...Sorry...");      
      }
  }

    
	console.log(blogPostCount);

	 getAllLinks(blogPostCount, 20,function(result){

		//console.log(result);
		
		_callback(result);
	});
	
	

	
});

}

function getAllLinks(blogPostCount, offSetValue, _callback){
	
	var allLinks ={};
	var runningNumber;
	var isComplete = false;	
	var ajaxCallRemain = Math.ceil(blogPostCount/offSetValue);
	console.log(ajaxCallRemain);

	for(runningNumber =0; runningNumber < blogPostCount; runningNumber += offSetValue){

        		getLinks(runningNumber,offSetValue,function(result){
                		console.log(result);
                		Object.assign(allLinks , result);
				
				ajaxCallRemain--;
				if(ajaxCallRemain <=0){
				        //console.log(allLinks);
					_callback(allLinks);	
				}          		
				
				
				
        		});
		

	}
	

}

function getLinks(runningNumber,offSetValue,_callback){

        var links ={};
        client.posts(tumblrSiteUrl, { type: 'link', limit: 20, offset: runningNumber }, function (err, data) {

                if(err){

                        console.log(err);
                }else{

                        for(var post =0; post < data.posts.length; post++){
				
				
				var postTitle =  data.posts[post].title;
				var URL = data.posts[post].url ;
 
				links[postTitle] = URL;
                                //links = links + ("<li>" + postTitle +" "+ URL + "</li>");
                        }

                        _callback(links);
                }

        });



}











	

  

