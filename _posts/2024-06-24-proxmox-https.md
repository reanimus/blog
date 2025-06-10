---
layout: post
name:   "proxmox-port-443"
title:  "Running Proxmox VE's HTTPS over port 443"
date:   Mon Jun 24 20:48:35 PDT 2024
---
There's a [page on the Proxmox wiki](https://pve.proxmox.com/wiki/Web_Interface_Via_Nginx_Proxy) that describes setting up an nginx reverse proxy on the host to forward requests from port 443 to the default HTTPS port (8006). However, this is unnecessary. It can just as easily be accomplished without installing any packages.

Since Proxmox runs on systemd, you can use the built in port forwarding functionality that systemd provides. Log in to the server as root and create two files. The first is `/etc/systemd/system/https-redirect.service`:

{% highlight systemd linenos %}
[Unit]
Description=HTTPS redirect
Requires=network.target
After=network.target

[Service]
ExecStart=/usr/lib/systemd/systemd-socket-proxyd 127.0.0.1:8006

[Install]
WantedBy=multi-user.target
{% endhighlight %}

Then, create `/etc/systemd/system/https-redirect.socket`:

{% highlight systemd linenos %}
[Socket]
ListenStream=0.0.0.0:443

[Install]
WantedBy=sockets.target
{% endhighlight %}

Then, reload daemons and enable them both:

{% highlight systemd linenos %}
systemctl daemon-reload
systemctl enable --now https-redirect.socket
systemctl enable --now https-redirect.service
{% endhighlight %}
