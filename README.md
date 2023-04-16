## Install

### Dependencies

This package depends on `openvpn`, `net-tools` and `pkill`

```sh
sudo apt install openvpn net-tools procps
```

### NPM install:

```sh
npm install vpn-fetch
```

### About

I created this package out of necessity, and as I haven’t found anything similar in my research I decided to publish it to help anyone out there who are in the same rabbit role that I went trying to achieve the functionality. It is heavily based on this [blog post](http://www.georgiecasey.com/2013/07/26/how-to-use-overplay-and-other-vpns-as-a-curl-proxy/) found in this [question](https://serverfault.com/questions/653496/use-openvpn-tun-device-for-specific-request). To make the network requests it uses the [got](https://www.npmjs.com/package/got) package, as it supports the `localAddress` option.

When executed, it will ask for the root password, it is asked because the openvpn client needs to be run as sudo.

### Example

The `VPNFetch` constructor takes the VPN config file, and a txt file with the VPN server username and password sepparated by a newline.

```js
const configFiles = await readdir("/etc/openvpn/ovpn_tcp");
const randomConfig =
  configFiles[Math.floor(Math.random() * configFiles.length)];

const vpnFetch = new VPNFetch(
  "/etc/openvpn/ovpn_tcp/" + randomConfig,
  "./login_information"
);
await vpnFetch.connect();
const response = await vpnFetch.get("https://ifconfig.me/ip");
console.log("IP:", response.body);
```
