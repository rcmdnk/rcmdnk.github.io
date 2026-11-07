var shareCheckReset = function(add) {
  shareCheck = {};
  shareCheck.url_set = [];
  shareCheck.add = add;
  shareCheckResetBar();
  shareCheck.share_get_tot_list = document.getElementById("share-get-tot-list");
  shareCheck.share_get_list = document.getElementById("share-get-list");
  if(!add){
    shareCheck.share_get_tot_list.innerHTML = "";
    shareCheck.share_get_list.innerHTML = "";
  }
  shareCheck.n_posts = shareCheck.share_get_list.childNodes.length
}

var shareCheckResetBar = function() {
  shareCheck.bar = document.getElementById("bar-get-urls");
  shareCheck.num = document.getElementById("num-get-urls");
  shareCheck.num_tot = document.getElementById("num-get-urls-tot");
  shareCheck.bar.value = 0;
  shareCheck.bar.max = 100;
  shareCheck.num.innerHTML = "0 %";
  shareCheck.num_tot.innerHTML = "";
  shareCheck.bar_share = document.getElementById("bar-get-shares");
  shareCheck.num_share = document.getElementById("num-get-shares");
  shareCheck.bar_share.value = 0;
  shareCheck.bar_share.max = 100;
  shareCheck.num_share.innerHTML = "0 %";
}

var shareCheckPrepareTot = function(socials) {
  var p = document.createElement("p");
  p.innerHTML = "<br><br><br>Total Count (Click to sort)";
  shareCheck.share_get_tot_list.appendChild(p);
  socials.forEach(function(c){
    if(! document.siteinfo[c].checked) return;
    var tot = document.createElement("li");
    var cap = c.charAt(0).toUpperCase() + c.slice(1);
    tot.innerHTML = '<p title="Sort by '+cap+'" id="'+c+'_shuffle" class="btn '+c+'_custom" >'+cap+' <span id="'+c+'_tot"></span></p>';
    tot.onclick = function(){
      var elements = [].slice.call(shareCheck.share_get_list.getElementsByClassName("post"));
      elements.sort(
        function(a,b){
          return parseInt(b.getElementsByClassName(c+"Count")[0].textContent)-parseInt(a.getElementsByClassName(c+"Count")[0].textContent);
        }
      );
      for (var i=0;i<elements.length;i++) {
        document.getElementsByClassName("posts")[0].appendChild(elements[i]);
      }
    };
    shareCheck.share_get_tot_list.appendChild(tot);
  });
};

var shareCheckGetPage = function(url,format,index) {
  var format = (format !== undefined) ? format : "html";
  var index = (index !== undefined) ? index : 0;
  var q = "";
  if(format == "sitemap"){
    q = "select url.loc from xml where url='" + url + "'";
  }else if(format == "feed"){
    q = "select title, link from feed where url='" + url + "'";
  }else if(format == "html"){
    q = "select title from html where url='" + url + "' and xpath='/html/head'";
  }else{
    return null;
  }
  var data = {
    type: 'GET',
    dataType: 'json',
    url: "http://query.yahooapis.com/v1/public/yql",
    data: {
      noncache: new Date().getTime(),
      q: q,
      format: "json",
      env: "http://datatables.org/alltables.env",
    },
    success: function(data){
      if(data.query.results){
        if(format == "sitemap"){
          shareCheckGetFromSitemap(data.query.results);
        }else if(format == "feed"){
          shareCheckGetFromFeed(data.query.results);
        }else{
          shareCheckGetTitle(url, data.query.results, index);
          shareCheckBarGetUrlForward();
        }
      }
    },
    error: function(data){
    }
  };
  if(!shareCheck.requests)shareCheck.requests = [];
  shareCheck.requests.push($.ajax(data));
};

var shareCheckSetBarGetUrl = function (max) {
  if(shareCheck.bar != null && shareCheck.num != null){
    shareCheck.bar.value = 0;
    shareCheck.bar.max = max;
    shareCheck.num.innerHTML = "0 %";
    shareCheck.num_tot.innerHTML = "(Total: " + (max + shareCheck.n_posts) + " pages)";
  }
}

var shareCheckBarGetUrlForward = function () {
  if(shareCheck.bar != null && shareCheck.num != null){
    shareCheck.bar.value +=1;
    shareCheck.num.innerHTML = Math.floor(100*shareCheck.bar.value/shareCheck.bar.max) + " %";
  }
}

var shareCheckGetTitle = function(u,j,i) {
  shareCheck.url_set.push({"index": i, "url": u, "title": j.head.title});
};

var shareCheckGetFromSitemap = function(url_list) {
  var max = url_list.urlset.length-shareCheck.offset;
  if(shareCheck.npages != 0){
    max = Math.min(max, shareCheck.npages);
  }
  shareCheckSetBarGetUrl(max);
  url_list.urlset.some(function(u, i){
    if(i<shareCheck.offset)return;
    shareCheckGetPage(u.url.loc,'html',i);
    return (shareCheck.npages!=0 && (i+1-shareCheck.offset) >= shareCheck.npages);
  });
  document.getElementsByName("siteinfo-next")[0].setAttribute("data-offset", shareCheck.offset + max);
};

var shareCheckGetFromFeed = function(url_list) {
  var max = url_list.entry.length-shareCheck.offset;
  if(shareCheck.npages != 0){
    max = Math.min(max, shareCheck.npages);
  }
  shareCheckSetBarGetUrl(max);
  url_list.entry.forEach(function(u, i){
    if(i<shareCheck.offset)return;
    shareCheck.url_set.push({"index": i, "url": u.link.href, "title": u.title.content});
    shareCheckBarGetUrlForward();
    return (shareCheck.npages!=0 && (i+1+shareCheck.offset) >= shareCheck.npages);
  });
  document.siteinfo["siteinfo-next"].setAttribute("data-offset", shareCheck.offset + max);
};

var shareCheckPreparePosts = function(socials) {
  var socialurls = {'hatebu': "http://b.hatena.ne.jp/entry/",
                    'twitter': "http://twitter.com/intent/tweet?url=",
                    'facebook': "http://www.facebook.com/sharer.php?u=",
                    'pocket': "http://getpocket.com/edit?url=",
                    'linkedin': "http://www.linkedin.com/shareArticle?url=",
                    'stumble': "http://www.stumbleupon.com/badge/?url=",
                    'pinterest': "http://pinterest.com/pin/create/button/?url=",
                    'buffer': "https://api.bufferapp.com/1/links/shares.json?url=",
                    'delicious': "https://del.icio.us/save?v=5&url="
  };
  var socialmarks = {'hatebu': "B!",
                     'twitter': '<i class="fa fa-twitter"></i>',
                     'facebook': '<i class="fa fa-facebook"></i>',
                     'pocket': 'P',
                     'linkedin': '<i class="fa fa-linkedin"></i>',
                     'stumble': '<i class="fa fa-stumbleupon"></i>',
                     'pinterest': '<i class="fa fa-pinterest"></i>',
                     'buffer': 'B',
                     'delicious': '<i class="fa fa-delicious"></i>'
  };

  shareCheck.url_set.sort(function(a,b){return a.index>b.index;});
  shareCheck.url_set.forEach(function(u){
    var url = u.url;
    var title = u.title;
    var post = document.createElement("li");
    post.className = 'post';
    var share = document.createElement("div");
    share.className = "share-button";
    var share_list = document.createElement("ul");
    socials.forEach(function(s){
      var cap = s.charAt(0).toUpperCase() + s.slice(1);
      var l = document.createElement("li");
      l.innerHTML = '<a href="'+socialurls[s]+url+'" title="Save to '+cap+'" targea="_blank"><p class="'+s+'_custom" >'+socialmarks[s]+' <span class="'+s+'Count" data-share-url="'+url+'"></span></p></a>';
      share_list.appendChild(l);
    });
    share.appendChild(share_list);
    post.appendChild(share);
    var p = document.createElement("p");
    p.innerHTML = '<br><a href="'+url+'">'+title+'</a>';
    post.appendChild(p);
    shareCheck.share_get_list.appendChild(post);
  });
}

var shareCheckGetPages = function(next, add) {
  shareCheckReset(add);

  var url = encodeURI(document.siteinfo.url.value);
  if (! url.match(/https?:\/\//)) {
    alert("Invalid URL: " + url);
    return;
  }
  var atom = "";
  var sitemap = "";
  var file = url.split("/").pop();
  var ext = file.split(".").pop();
  var xml = "";
  var check = false;
  shareCheck.npages = document.siteinfo.npages.value || 0;
  if(next){
    shareCheck.offset = Number(document.siteinfo["siteinfo-next"].getAttribute("data-offset")) || 0;
  }else{
    shareCheck.offset = 0;
  }
  if(file == "sitemap.xml"){
    shareCheckGetPage(url, 'sitemap');
  }else if(file == "atom.xml"){
    shareCheckGetPage(url, 'feed');
  }else if(ext != "html" || ext != "htm"){
    check = true;
    shareCheckGetPage(url+"/sitemap.xml", 'sitemap');
  }
  $.when.apply($, shareCheck.requests).always(function() { // wait sitemap job submitting jobs.
    $.when.apply($, shareCheck.requests).always(function() { // wait all submitted jobs.
      if(shareCheck.url_set.length == 0 && check){
        shareCheckGetPage(url+'/atom.xml', 'feed');
      }
      $.when.apply($, shareCheck.requests).done(function() {
        if(shareCheck.url_set.length == 0){
          //console.log('no list, check page itself');
          shareCheckSetBarGetUrl(1);
          shareCheckGetPage(url,'html',0);
        }
        $.when.apply($, shareCheck.requests).always(function() {
          if(! shareCheck.url_set.length) {
            alert("Page not found: " + url);
            return false;
          }
          var socials=[];
          var smarks = ["hatebu", "twitter",
                       "facebook", "pocket", "linkedin",
                       "stumble", "pinterest", "buffer", "delicious"];
          for(var i=0;i<smarks.length;i++){
            if(document.siteinfo[smarks[i]].checked)socials.push(smarks[i]);
          }

          if(!shareCheck.add || shareCheck.offset == 0)shareCheckPrepareTot(socials);
          shareCheckPreparePosts(socials);
          socialCount(socials);
        }).fail(function() {
          alert("Page not found: " + url);
          return false;
        });
      });
    });
  });
};

document.getElementsByName("siteinfo-go")[0].onclick = function(){
  shareCheckGetPages(false, false);
};
document.getElementsByName("siteinfo-next")[0].onclick = function(){
  shareCheckGetPages(true, false);
};
document.getElementsByName("siteinfo-add")[0].onclick = function(){
  shareCheckGetPages(true, true);
};
