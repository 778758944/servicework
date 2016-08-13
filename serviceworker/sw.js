/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2016-07-23 17:21:20
 * @version $Id$
 */
importScripts('profill.js');
var base='/serviceworker/';
var urlsToCache=[
	base+'style.css',
	base+'main.js',
	base+'girl.jpg',
	base+'servicework.html',
	base+'offline.html'
];

var staticCacheName='static';
var version='v8::';

function updateStaticCache(){
	return caches.open(version+staticCacheName)
		.then(function(cache){
			return cache.addAll(urlsToCache);
		})
}

self.addEventListener('install',function(event){
	console.log('install');
	self.skipWaiting();
	event.waitUntil(updateStaticCache())
})

self.addEventListener('activate',function(event){
	console.log('active');
	event.waitUntil(
		caches.keys().then(function(keys){
			console.log(keys);
			return Promise.all(keys.filter(function(key){
				return key.indexOf(version) !==0;
			})
			.map(function(key){
				return caches.delete(key);
			})
			)
		})
		);
})

// self.registration.showNotification('MESSAGE',{
// 	body:'the message',
// 	icon:'girl.jpg',
// 	tag:'my-tag'
// })
// console.log(self.registration.showNotification('message',{
// 	body:'The Message',
// 	icon:'girl.jpg',
// 	tag:'my-tag'
// }));

self.addEventListener('push',function(e){
	console.log('push',e);
	var title='Push Message';
	e.waitUntil(
		self.registration.showNotification(title,{
			body:'The Message',
			icon:'/girl2.jpg',
			tag:'my-tag'
		})
	)
})


self.addEventListener('fetch',function(event){
	var request=event.request;
	var accept=request.headers.get('Accept')
	if(request.method !=='GET'){
		event.respondWith(fetch(request));
		return;
	};

	// console.log('deal get');
	console.log(accept);


	if(accept.indexOf('text/html')!==-1){
		console.log('deal html');
		// event.respondWith(fetch(request));
		// return;
		event.respondWith(
			fetch(request).then(function(response){
				var copy=response.clone();
				caches.open(version+staticCacheName).then(function(cache){
					cache.put(request,copy);
				})
				return response;
			}).catch(function(){
				return caches.match(request).then(function(response){
					console.log(response);
					return response || caches.match(base+'offline.html');
				})
			})
		)
		return;
	}


	// event.respondWith(
	// 	caches.match(request)
	// 	)

	if(accept.indexOf('text/css')!==-1){
		console.log('fetch c');
		event.respondWith(
			fetch(request,{credentials:"include"})
			  .then(function(response){
			  	var copy=response.clone();
			  	caches.open(version+staticCacheName).then(function(cache){
			  		cache.put(request,copy);
			  	})
			  	return response;
			  }).catch(function(){
			  	return caches.match(request).then(function(response){
			  		return response || caches.match('/offline');
			  	})
			  })
		);




		// event.respondWith(
		// 	fetch(request).catch(function(){
		// 		return caches.match(request);
		// 	})
		// )
		return;
	}

	// if(request.headers.get('Accept').indexOf('image')!==-1){
		// console.log('deal image');
		// event.respondWith(fetch('http://localhost:8888/serviceworker/girl2.jpg',{method:"GET"}))
	// }



	event.respondWith(
		caches.match(request).then(function(response){
			return response || fetch(request).catch(function(){
				console.log('deal no image');
				if(accept.indexOf('image') !== -1){
					console.log('deal no img')
					return new Response('<svg>...</svg>',{headers:{
						"Content-Type":'image/svg+xml'
					}});
				}
			})
		})
		)


})

self.addEventListener('notificationclick',function(e){
	console.log('on notification click',e.notification.tag);
	event.notification.close();

	e.waitUntil(
		clients.matchAll({
			type:'window'
		})
		.then(function(clientLists){
			for(var i=0;i<clientLists.length;i++){
				var client=clientLists[i];
				if(client.url == '/' && 'focus' in client){
					return client.focus();
				}
			}
			if(clients.openWindow){
				return clients.openWindow('/')
			}
		})
		)
})




























