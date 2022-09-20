#!/bin/sh
# echo "$dev : $ifconfig_local -> $ifconfig_remote gw: $route_vpn_gateway"
echo "[[network interface]]:$ifconfig_local:$1"
ip route add default via $route_vpn_gateway dev $dev table $1
ip rule add from $ifconfig_local table $1
ip rule add to $route_vpn_gateway table $1
ip route flush cache
exit 0
