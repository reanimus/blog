---
layout: home
title: "home"
---
<div class="block">
<div class="content">
<h1 class="title"><a href="https://guzman.io">~alex_guzman</a>/<a href="{{ site.url }}">blog</a></h1>
</div>
</div>
{% assign total = 0 %}{% for post in site.posts %}{%- assign current_size = post.content | size -%}{% assign total = total | plus: current_size %}{% endfor %}
<div class="block">
<div class="content">
<pre>
blog.guzman.io:~ alex_guzman$ ls -lTt blog
total {{ total }}
{% for post in site.posts %}-rw-r--r--  1 alex_guzman  users  {{ post.content | size }} {{ post.date | date: "%b %d %T %Y" }} <a href="{{ post.url }}">{{ post.name }}</a>
{% endfor %}blog.guzman.io:~ alex_guzman$ <blink>_</blink>
</pre>
</div>
</div>