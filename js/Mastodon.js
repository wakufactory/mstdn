Mastodon = function(server,token) {
	this.server = server ;
	this.token = token ;
}
Mastodon.prototype.api = function(path,p,cb) {
	var path = "https://"+this.server+path ;
	var param = {} ;
	if(p.max_id>0) param.max_id = p.max_id ;
	if(p.since_id>0) param.since_id = p.since_id ;
	if(p.limit>0) param.limit = p.limit ;
	path = path + ((path.search(/\?/)==-1)?"?":"&") ;
	for(var i in param) path = path + i+"="+param[i]+"&" ;

	var req = new XMLHttpRequest();
	this.req = req ;
	req.open("get",path,true) ;
	req.responseType = "json" ;
	req.setRequestHeader("Authorization","Bearer "+this.token ) ;
	req.onload = function() {
		console.log("onload") ;
		cb(this.response,this.getResponseHeader("Link")) ;
	}
	req.onerror = function() {
		console.log("onerror" );
		cb(null) ;
	}
	req.send() ;	
}
Mastodon.prototype.stream = function(api,p,cb) {
	var req = new XMLHttpRequest();
	this.req = req ;
	var path = "https://"+this.server+api ;
	req.open("get",path,true) ;
	req.responseType = "text" ;
	req.setRequestHeader("Authorization","Bearer "+this.token ) ;
	req.onload = function() {
		console.log(this.response);
	}
	req.onerror = function() {
		cb(null) ;
	}
	var size = 0 ;
	var buf = "" ;
	var ev = "" ;
	req.onreadystatechange = function(d) {
//			console.log(this);
		if(this.readyState == 3) {
			var res  = this.response.substr(size).split("\n")  ;
			var m ;
			for(i in res) {
				var s = res[i] ;
//					console.log([s]) ;
				if(m = /^event: (.+)/.exec(s)) {
					ev = m[1] ;
					continue ;
				} 
				if( m = /^data: (.+)/.exec(s)) {
					buf = m[1] ;
					continue ;
				}
				if( s.match(/^:thump/)) continue ;
				if( s=="" && buf!="") {
					cb(ev,buf) ;
					buf="" ;
				}
				buf += s ;
			}
			size = this.response.length ;
		}
		if(this.readyState == 4) { //error
			console.log("state error");
//			console.log(this) ;
//			cb(null) ;
		}
	}
	req.send() ;	
}
Mastodon.prototype.abort = function() {
	this.req.abort();
	this.req = null ;
} 