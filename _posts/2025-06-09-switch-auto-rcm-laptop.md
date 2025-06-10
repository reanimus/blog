---
layout: post
name:   "switch-auto-rcm-laptop"
title:  "Turning your laptop into a Switch auto-RCM dongle"
date:   Mon Jun 09 22:15:00 PDT 2025
---
<img style="max-width: 33%; float: left; margin: 0 1em 1em 0" src="/assets/images/rcmloader.jpg" alt="Promo render of the RCMloader ONE" />
I've had a Nintendo Switch since soon after they launched. Back when they were still hard to come across (much like the Switch 2 today), I got up early one morning to get in line at the Target in downtown Seattle where I heard they were getting a shipment. I wasn't the first in line, but I did manage to get one. Luckily for me, these units ended up having an [unpatchable BootROM exploit](https://nvidia.custhelp.com/app/answers/detail/a_id/4660/~/security-notice%3A-nvidia-tegra-rcm-vulnerability) present in the SoC they use. This means it's possible to jailbreak it, no matter what Nintendo does to update it.

Having recently bought my boyfriend a Switch 2, it renewed my interest in tinkering with my own hackable Switch. The method for hacking an unpatchable Switch like mine is what's referred to in the phone jailbreaking world as a "tethered jailbreak" -- that is to say, the jailbroken device requires a computer or some other device to help boot it into the hacked state. In the case of the Switch, this involves shorting two pins in the right Joy-Con rail and pressing two buttons on the device (much like putting an Android phone into recovery mode). Then, while in recovery mode, the computer it's tethered to sends an exploit over USB, booting the Switch in a jailbroken state.

As you can imagine, this means that any time you reboot, you have to have a computer nearby to boot into the hacked mode. This can be a bit of a hassle. On top of that, there are various ways to short the Joy-Con pins, but most of them run the risk of damaging the pins on the rail. For that reason, I previously invested in a small dongle called the RCMloader ONE.

This device was great! You plugged it into your computer via the MicroUSB port, where it showed up as a drive and allowed you to put your exploits on there. Pressing the button on the front allowed you to cycle through the different exploits. Then, on the back, it comes with a small jig that can be slid into the right Joy-Con rail to short the required pins while minimizing the risk of damage to them. This device allowed me to carry everything I need to boot a jailbroken Switch in a single compact device.

So of course, it stopped working.

The device contains a small battery inside that lasts about few months on standby with a single charge. However, lithium batteries don't behave well when fully discharged, and these batteries aren't exactly the best. I left my device untouched for months, and now it fails to do anything when plugged into my Switch, despite showing up as a USB drive when plugged into a computer. Unfortunately, this is [somewhat of a known issue](https://gbatemp.net/threads/rcm-loader-battery.560455/) when letting the battery discharge for too long.

I'm still considering biting the bullet and seeing if replacing the battery is feasible. But in the meantime, I noticed some of the examples of "DIY dongles" are really nothing more than a bespoke Raspberry Pi distro. It got me thinking -- how hard would it be to turn any given computer into an RCM dongle? Turns out, if you're running Linux system with udev (see: most everyone running Linux) or macOS, it's pretty straightforward!

### Linux

On Linux, udev listens for hardware hotplug events and reacts according to the policy set by the system. In essence, you tell it what to do whenever hardware matching certain properties is detected. You can use it to change the ownership/permissions of devices, set up device symlinks, and even **execute a program in response to a device being plugged in**.

The last bit stood out to me. There's plenty of how-to articles telling you how to make udev do something like mount a drive automatically when plugged in. Usually, this is to mount a drive when plugged in or automatically sync a camera. But there's nothing stopping us from applying it to literally any device, including the RCM mode Switch!

First, you'll need a payload launcher to execute. Personally, I used [this Fusee Gelee implementation in Rust](https://github.com/austinhartzheim/fusee-gelee). I don't think the specific one used is important, as long as you know it works. Install your payload launcher. For mine, it looks like this:

{% highlight shell linenos %}
$ git clone https://github.com/austinhartzheim/fusee-gelee
$ cd fusee-gelee/
$ cargo build --release
$ sudo cp target/release/fusee-gelee /usr/local/bin
{% endhighlight %}

Then, download your payload. I'll be using [Hekate](https://github.com/ctcaer/hekate/releases), a bootloader for jailbroken Switches. In addition to simplifying the management of the hacked Switch partition, it offers many useful recovery and maintenance utilities. It also allows the payload sent over to remain the same even when Hekate itself updates; it chainloads to the updated version seamlessly.

Once you have your payload binary, place it somewhere on the filesystem. For me, I chose to put the payload `hekate_ctcaer_6.3.1.bin` at `/opt/hekate/payload.bin`. The location isn't important, feel free to put it wherever you'd like.

Now, the piece that puts it all together -- the udev rule. This goes in `/etc/udev/rules.d/60-switch-rcm.rules`.

{% highlight udev linenos %}
SUBSYSTEM=="usb", ATTRS{idVendor}=="0955", ATTRS{idProduct}=="7321", RUN+="/usr/local/bin/fusee-gelee /opt/hekate/payload.bin"
{% endhighlight %}

Then, reload udev (with systemd, run `systemctl reload systemd-udevd`). With the new rules in place, you should be able to put the Switch into recovery mode and launch a payload by simply plugging into your laptop.

### macOS

Turns out, launchd has similar support for reacting to device hotplug events. I found this out after implementing this in udev, and it turns out it's similarly straightforward!

Like before, you need to choose a payload launcher. I used [nxboot](https://github.com/mologie/nxboot), seeing as there aren't really that many CLI payload launchers for macOS. I didn't bother compiling it here (since it's not as easy as Rust makes things), and instead opted for downloading the latest release from Github. It's signed and notarized, too, so Gatekeeper doesn't mind it.

{% highlight shell linenos %}
$ curl -LO https://github.com/mologie/nxboot/releases/latest/download/nxboot
$ chmod +x nxboot
$ sudo cp nxboot /usr/local/bin
{% endhighlight %}

Similar to before, you should put your payload somewhere on the filesystem. For macOS, I put it at `/usr/local/share/nxboot/payload.bin`.

Then, create the launchd plist within `~/Library/LaunchAgents`. The filename should match the usual reverse DNS scheme used by macOS (for example, I used the name `io.guzman.RCMDaemon.plist`). The script should look something like this:

{% highlight xml linenos %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>Label</key>
        <string>io.guzman.RCMDaemon</string>
        <key>ProgramArguments</key>
        <array>
                <string>/usr/local/bin/nxboot</string>
                <string>/usr/local/share/nxboot/payload.bin</string>
        </array>
        <key>LaunchEvents</key>
        <dict>
                <key>com.apple.iokit.matching</key>
                <dict>
                        <key>com.apple.device-attach</key>
                        <dict>
                                <key>idProduct</key>
                                <integer>29473</integer>
                                <key>idVendor</key>
                                <integer>2389</integer>
                                <key>IOProviderClass</key>
                                <string>IOUSBDevice</string>
                                <key>IOMatchLaunchStream</key>
                                <true/>
                        </dict>
                </dict>
        </dict>
</dict>
</plist>
{% endhighlight %}

Obviously, you should adjust the Label as well as ProgramArguments to reflect the label/payload launcher and path you chose. Then, run `launchctl load -w ~/Library/LaunchAgents/io.guzman.RCMDaemon.plist`, replacing the plist name with whatever you called yours. After that, you should be able to plug your recovery mode Switch into your laptop and immediately have it run the jailbreak. Happy hacking!