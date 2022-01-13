var dns = require('dns');

function reverseLookup(ip) {
	dns.reverse(ip,function(err,domains){
		if(err!=null)	callback(err);

		domains.forEach(function(domain){
			dns.lookup(domain,function(err, address, family){
				console.log(domain,'[',address,']');
				console.log('reverse:',ip==address);
			});
		});
	});
}

dns.lookup('www.google.com', function(err, result) {
  console.log(result)
})

reverseLookup('142.250.187.164');