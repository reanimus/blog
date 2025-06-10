---
layout: home
title: "home"
---
<div class="block">
<div class="content">
<h1 class="title"><a href="https://guzman.io">~alex_guzman</a>/<a href="{{ site.url }}">blog</a></h1>
</div>
</div>
{% assign total = 0 %}{% assign longest_size = 0 %}{% for post in site.posts %}{% assign current_size = post.content | size %}{% assign total = total | plus: current_size %}{% assign current_len = current_size | escape | size %}{% if current_len > longest_size %}{% assign longest_size = current_len %}{% endif %}{% endfor %}{% assign longest_size = longest_size | minus: 1 %}
<div class="block">
<div class="content">
<pre>
blog.guzman.io:~ alex_guzman$ ls -lTt blog
total {{ total }}
{% for post in site.posts %}{% assign postsize = post.content | size %}{% assign postsize_len = postsize | escape | size %}{% assign postdate = post.date | date: "%b %d %T %Y" %}-rw-r--r--  1 alex_guzman  users  {% if postsize_len <= longest_size %}{% for i in (postsize_len..longest_size) %}&nbsp;{% endfor %}{% endif %}{{ postsize }} {{ postdate }} <a href="{{ post.url }}">{{ post.name }}</a>
{% endfor %}blog.guzman.io:~ alex_guzman$ <blink>_</blink>
</pre>
</div>
</div>
